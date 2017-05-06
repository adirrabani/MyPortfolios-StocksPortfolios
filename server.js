var express    = require("express"),
    app        = express(),
    bodyParser = require("body-parser"),
    mongoose   = require("mongoose"),
    Portfolio  = require("./portfolioSchema.js"),
    User = require("./userSchema.js"),
    request    = require('request'),
    async = require("async"),
    dividendsData  = require("./dividendsData.js"),
    passport = require("passport"),
    LocalStrategy = require("passport-local").Strategy,
    cookieParser = require('cookie-parser');
  
app.use(bodyParser.urlencoded({extended: true}));
app.set('views', __dirname + '/public/views');
app.use(express.static(__dirname + '/public'));
mongoose.createConnection("mongodb://adirke:adirke@ds159237.mlab.com:59237/portfoliosapp");

// Passport Configuration
app.use(cookieParser());
app.use(require("express-session")({
    secret:"BlaShelBLABLASheqNo",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Registration route (Using passport local strategy)
app.post("/register", function(req, res){
    var newUser = new User({username: req.body.username});
    console.log(req.body);
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log("Error in registration - " + err.message);
            res.status(400).json(err.message);
        } else {
            console.log(user);
            passport.authenticate("local")(req, res, function(){
                res.status(200).json(user);
            });    
        }
        
    });
});

// Login route
app.post("/login", passport.authenticate("local"), function(req, res){
    console.log(req.user);
    res.json(req.user);
});

// Logout route
app.post("/logout", function(req, res){
    req.logout();
    res.sendStatus(200);
});

// Check if user logged in route
app.get('/isLoggedIn', function(req, res){
    console.log(req.user);
    res.send(req.isAuthenticated() ? req.user : '0');
});


// Show all portfolios for the relevant user (main page)
app.get('/api/portfolios', function(req, res){
    // Checks if user is logged in and collect total value data for all portfolios
    if(req.isAuthenticated()){
        Portfolio.find({'owner': req.user.username}, function(err, allPortfolios){
            if(err){
                console.log("Cannot find portfolios - " + err);
                res.status(400).send("Cannot find portfolios - " + err);
            } else {
                // Calculate total value for each portfolio using getTotalValue, after that execute onFinished function
                async.eachSeries(allPortfolios, function(portfolio, next) {
                    getTotalValue(portfolio._id, function(err){
                        if(err){
                            next(err);
                        } else {
                            next();
                        }
                        //console.log("DONE for id " + portfolio._id);
                    });
    
                }, onFinished);
                
                function onFinished(error){
                    if(error){
                        console.log("Portfolio value calculation error : " + error);
                    }
                    Portfolio.find({'owner': req.user.username}, function(err, updatedPortfolios){
                            res.status(200).json(updatedPortfolios);
                        
                    });
                }
            }    
        });    
    } else {
        // If user is not logged in shows example portfolio
        Portfolio.find({'name': 'example'}, function(err, examplePortfolio){
                res.status(200).json(examplePortfolio);
            
        });
    }
    
});

// Add new portfolio
app.post('/api/portfolios', isLoggedIn, function(req, res){
    var newPortfolio = {name: req.body.name, owner: req.user.username};
    
    Portfolio.create(newPortfolio, function(err, newPortfolio){
        if(err){
            console.log("Error while creating new portfolio : " + err);
        } else {
            res.json(newPortfolio);
        }
    });    
});

// Show specific portfolio
app.get("/api/portfolios/:id", checkPortfolioOwnershipShow, function(req, res) {
    // Find the relevant portfolio using 'id' parameter
    Portfolio.findOne({
        '_id': req.params.id
    }, function(err, foundPortfolio) {
        if (err) {
            console.log("Portfolio cannot be found : " + err);
            res.status(400).send("Portfolio cannot be found");
        } 
        else if (!foundPortfolio) {
            console.log(err);
            res.status(400).send("Portfolio cannot be found");
        }
        // Handle case when portfolio is empty
        else if(foundPortfolio.stocks.length === 0) { 
            foundPortfolio.totalGainLoss        = 0;
            foundPortfolio.totalGainLossPercent = 0;
            foundPortfolio.totalValue = 0;
            foundPortfolio.save();
            res.json(foundPortfolio);
        } 
        else {
            var symbolsQuery = "";
            var jsonBody = "";
            // Build symbols list for the google finance API, for example - 'https://www.google.com/finance/info?q=tsem,xlf'
            for (var i = 0; i < foundPortfolio.stocks.length; i++) {
                symbolsQuery += foundPortfolio.stocks[i].symbol + ",";
            }
            var queryUrl = [('https://www.google.com/finance/info?q=' + symbolsQuery)];
            //console.log(queryUrl);

            // Running synchronize query against Google finance API, jsonBody is array that holds all the data of the stocks in the portfolio
            async.eachSeries(queryUrl, function(url, next) {
                request(url, function(err, response, body) {
                    if (!err && response.statusCode == 200) {
                        jsonBody = body.replace("// ", "");
                        jsonBody = JSON.parse(jsonBody);
                        next();
                    } else {
                        console.log("Error from api - " + err);
                        next(err);
                    }
                })
            }, onFinished)

            // After query execution sends stocks data for the specified portfolio.   
            function onFinished(err) {
                foundPortfolio.totalValue = 0;
                if (err) {
                    console.log("ERROR " + err);
                } else {
                    for (var i = 0; i < foundPortfolio.stocks.length; i++) {
                        
                        try {
                            var currentStock = jsonBody.find(o => o.t === foundPortfolio.stocks[i].symbol);
                        }
                        // Catch when stock information couldn't be retrieved from Google API
                        catch (err) {
                            console.log("Stock information could not be retrieved from Google API : " + err);
                        }
                        

                        // Prepare stock object
                        if (currentStock) {
                            foundPortfolio.stocks.id(foundPortfolio.stocks[i]._id).lastPrice       = currentStock.l;
                            foundPortfolio.stocks.id(foundPortfolio.stocks[i]._id).change          = currentStock.c;
                            foundPortfolio.stocks.id(foundPortfolio.stocks[i]._id).changePercent   = currentStock.cp;
                            foundPortfolio.stocks.id(foundPortfolio.stocks[i]._id).updateTime      = currentStock.lt;
                            foundPortfolio.stocks.id(foundPortfolio.stocks[i]._id).gainLoss        = (currentStock.l - foundPortfolio.stocks.id(foundPortfolio.stocks[i]._id).price) * foundPortfolio.stocks.id(foundPortfolio.stocks[i]._id).shares;
                            foundPortfolio.stocks.id(foundPortfolio.stocks[i]._id).gainLossPercent = (currentStock.l - foundPortfolio.stocks.id(foundPortfolio.stocks[i]._id).price) / foundPortfolio.stocks.id(foundPortfolio.stocks[i]._id).price * 100;
                            foundPortfolio.stocks.id(foundPortfolio.stocks[i]._id).value           = currentStock.l * foundPortfolio.stocks.id(foundPortfolio.stocks[i]._id).shares;
                            foundPortfolio.totalValue += (currentStock.l * foundPortfolio.stocks.id(foundPortfolio.stocks[i]._id).shares);
                        } else { // if stock data was not retrieved - enter null to the vars
                            foundPortfolio.stocks.id(foundPortfolio.stocks[i]._id).lastPrice       = null;
                            foundPortfolio.stocks.id(foundPortfolio.stocks[i]._id).change          = null;
                            foundPortfolio.stocks.id(foundPortfolio.stocks[i]._id).changePercent   = null;
                            foundPortfolio.stocks.id(foundPortfolio.stocks[i]._id).updateTime      = null;
                            foundPortfolio.stocks.id(foundPortfolio.stocks[i]._id).gainLoss        = null;
                            foundPortfolio.stocks.id(foundPortfolio.stocks[i]._id).gainLossPercent = null;
                            foundPortfolio.stocks.id(foundPortfolio.stocks[i]._id).value           = null;
                        }
                        // Fetch dividends data
                        dividendsData.fetchDividendData(foundPortfolio.stocks.id(foundPortfolio.stocks[i]._id), function(sym, ret){
                            console.log("Dividens fetch has ended - " + sym);
                        });
                    }
                    
                    // Calculate total Gain/Loss
                    foundPortfolio.totalGainLoss        = foundPortfolio.totalValue - foundPortfolio.totalBuy;
                    foundPortfolio.totalGainLossPercent = (foundPortfolio.totalValue - foundPortfolio.totalBuy) / foundPortfolio.totalBuy * 100;
                    
                    Portfolio.findOneAndUpdate(
                        {"_id": foundPortfolio._id },
                        { 
                            "$set": {
                                "totalValue" : foundPortfolio.totalValue,
                                "totalGainLoss" : foundPortfolio.totalGainLoss,
                                "totalGainLossPercent" : foundPortfolio.totalGainLossPercent
                            }
                        },
                        function(err,doc) {
                            if(err){
                                console.log("Error while update portfolio value" + err);
                            } 
                        }
                    );
                    
                    //console.log(foundPortfolio);
                    res.json(foundPortfolio);    
                
                }
            }
        }
    });
});


// Verify user ownership and delete specific portfolio
app.delete("/api/portfolios/:id", checkPortfolioOwnershipChange, function(req,res){
   Portfolio.findByIdAndRemove(req.params.id, function(err){
       if(err){
           console.log(err);
           res.json(req.body);
       } else {
           res.json(req.body);
       }
   });
});

// Verify user ownership and show specific stock
app.get("/api/portfolios/:id/stocks/:stock_id", checkPortfolioOwnershipShow, function(req,res){
    var portfolioId = req.params.id;
    var stockId = req.params.stock_id;
   
    Portfolio.findOne(
    {'_id': portfolioId}, 'stocks', function(err, foundPortfolio) {
            if(err){
                console.log(err);
                res.json(err);
            } else {
                if(foundPortfolio.stocks.id(stockId)){
                    console.log(foundPortfolio.stocks.id(stockId));
                    res.json(foundPortfolio.stocks.id(stockId));    
                } else {
                    console.log("Stock was not found");
                    res.json("Stock was not found");
                }
            }
        }
    );
    
});

// Add stocks to existing portfolio
app.post('/api/portfolios/:id/stocks', checkPortfolioOwnershipChange, function(req, res){
    if(req.body.symbol && req.body.buyDate && req.body.shares && req.body.price){
        // Check if symbol exists in Google API
        request('https://www.google.com/finance/info?q=' + req.body.symbol, function (err, response, body) {
            if (!err && response.statusCode == 200) {
                var id = req.params.id;
                console.log(req.body);
                var newStock = {symbol: req.body.symbol.toUpperCase(), buyDate: req.body.buyDate, price: req.body.price, shares: req.body.shares, lastPrice:null,change:null, changePercent:null, updateTime:null};
             
                Portfolio.findById(id, function(err,foundPortfolio){
                    // Check if stock is already exists
                    var existStock = foundPortfolio.stocks.find(o => o.symbol === req.body.symbol.toUpperCase());
                    
                    if(err){
                        console.log("Portfolio cannot be found : " + err);
                        res.status(400).send("Portfolio cannot be found" + err);
                    } 
                    //  Handle case when stock is already exists
                    else if (existStock) {
                        console.log("Stock " + req.body.symbol.toUpperCase() + " already exists ");
                        res.status(400).send("Stock " + req.body.symbol.toUpperCase() + " already exists ");
                    }
                    else {
                        foundPortfolio.stocks.push(newStock);
                        foundPortfolio.totalBuy += newStock.price * newStock.shares;
                        foundPortfolio.save(function(err,savedPortfolio) {
                            if (err) { // (A)
                                console.log("Stock " + req.body.symbol.toUpperCase() + " cannot be added - " + err);
                                res.status(400).send(""+err);
                            } else {
                                var currentStock = savedPortfolio.stocks[savedPortfolio.stocks.length-1];
                                dividendsData.fetchDividendData(currentStock, function(sym, ret){
                                    //console.log("Dividens fetch has ended - " + sym);
                                });
                                res.json(foundPortfolio);    
                            }
                        });
                        
                    }         
                }); 
            } else {
                console.log("Stock " + req.body.symbol + " cannot be found");
                res.status(400).send("Stock " + req.body.symbol + " cannot be found");
            } 
        });  
    } else {
        res.status(400).send("All the fields are required");
    }
});

// Update specific stock
app.put("/api/portfolios/:id/stocks/:stock_id", checkPortfolioOwnershipChange, function(req,res){
    if(req.body.symbol && req.body.buyDate && req.body.shares && req.body.price){
        var portfolioId = req.params.id;
        var stockId = req.params.stock_id;
        
        // Update stock with new data
        var updatedStock = {buyDate: req.body.buyDate, price: req.body.price, shares: req.body.shares};
        Portfolio.findOne(
        {'_id': portfolioId}, function(err, foundPortfolio) {
                if(err){
                    console.log(err);
                    res.status(400).send("Portfolio cannot be found");
                } else {
                    console.log()
                    foundPortfolio.totalBuy += (updatedStock.price * updatedStock.shares) - (foundPortfolio.stocks.id(stockId).price * foundPortfolio.stocks.id(stockId).shares);
                    foundPortfolio.stocks.id(stockId).buyDate = updatedStock.buyDate;
                    foundPortfolio.stocks.id(stockId).price = updatedStock.price;
                    foundPortfolio.stocks.id(stockId).shares = updatedStock.shares;
                    foundPortfolio.save(function(err) {
                        if (err) {
                            console.log("Stock " + req.body.symbol.toUpperCase() + " cannot be modified - " + err);
                            res.status(400).send(""+err);
                        } else {
                            // Add dividend information
                            dividendsData.fetchDividendData(foundPortfolio.stocks.id(stockId), function(sym, ret){
                                console.log("Dividens fetch has ended - " + sym);
                                 Portfolio.findOne(
                                    {'_id': portfolioId}, 'stocks', function(err, foundPortfolio) {
                                        if (err) { 
                                            console.log("Stock " + req.body.symbol.toUpperCase() + " cannot be modified - " + err);
                                            res.status(400).send(""+err);
                                        } else {
                                            res.json(foundPortfolio);
                                        }
                                    });
                            });
                        }
                    });
                }
            }
        );    
    } else {
        res.status(400).send("All the fields are required");
    }
    
    
});

// Check portfolio ownershop and delete specific stock
app.delete("/api/portfolios/:id/stocks/:stock_id", checkPortfolioOwnershipChange, function(req,res){
    var portfolioId = req.params.id;
    var stockId = req.params.stock_id;
    
    var updatedStock = {buyDate: req.body.buyDate, price: req.body.price, shares: req.body.shares};
   
    Portfolio.findOne(
    {'_id': portfolioId}, function(err, foundPortfolio) {
            if(err){
                console.log("Portfolio was not found - " + err);
                res.status(400).send("Portfolio cannot be found");
            } else {
                // Check if stock is exists in portfolio, if not return 400.
                if(foundPortfolio.stocks.id(stockId)){
                    try {
                        foundPortfolio.totalBuy -= (foundPortfolio.stocks.id(stockId).price * foundPortfolio.stocks.id(stockId).shares);
                        foundPortfolio.stocks.id(stockId).remove();
                    } catch (err) {
                        // if stock exists but could not be removed - return 400
                        console.log("Stock could not be removed : " + err);
                        res.status(400).send("Stock could not be removed");
                    }
                    foundPortfolio.save();
                    //console.log("foundPortfolio  " + foundPortfolio);
                    res.json(foundPortfolio);
                } else {
                    console.log("Stock could not be removed : " + err);
                    res.status(400).send("Stock could not be found");
                }
            }
        }
    );
    
});


// Update specific portfolio value data (after adding new stock)
app.get("/api/portfolios/:id/value", checkPortfolioOwnershipChange, function(req,res){
    var portfolioId = req.params.id;
    getTotalValue(portfolioId,function(err){
        if(err){
            console.log("Value data could not be retrieved");
            res.status(400).send("Value data could not be retrieved");
        } else {
            console.log("Value added");
            res.status(200).send("Portfolio value was updated");
        }
    })
});

// Redirecting all other requests to angular route component
 app.get('*', function(req, res) {
    res.sendFile(__dirname  + '/public/index.html'); // load index.html file
});

// Get stocks data from Google API
function getStockData(url, callback){
    console.log(url);
    request(url, function(err, response, body) {
        if (!err && response.statusCode == 200) {
            var jsonBody = body.replace("// ", "");
            jsonBody = JSON.parse(jsonBody);
            callback(jsonBody);
        } else {
            console.log("Error from api - " + err);
            callback(jsonBody, err);
        }
    });
}

function getTotalValue(portfolioId, callback){
    console.log("Start for ID = " + portfolioId);
     Portfolio.findOne({
        '_id': portfolioId
    }, function(err, foundPortfolio) {
        if(err){
            console.log("ERROR IS = " + err);
        } else {
            var symbolsQuery = "";
            //console.log("consopla  :   " + foundPortfolio);
            if(foundPortfolio.stocks.length > 0){
                // Build symbols list for the API
                for (var i = 0; i < foundPortfolio.stocks.length; i++) {
                    symbolsQuery += foundPortfolio.stocks[i].symbol + ",";
                }
                var queryUrl = 'https://www.google.com/finance/info?q=' + symbolsQuery;
                
                getStockData(queryUrl, function(jsonBody,err){
                    var totalValue = 0;
                    for (var i = 0; i < foundPortfolio.stocks.length; i++) {
                        // Catch when stock information couldn't be retrieved from Google API
                        try {
                            var currentStock = jsonBody.find(o => o.t === foundPortfolio.stocks[i].symbol);
                        } catch (err) {
                            console.log("Stock information could not be retrieved from Google API " + err);
                        }
                    
                        // Prepare stock object
                        if (currentStock) {
                            foundPortfolio.totalValue += currentStock.l * foundPortfolio.stocks.id(foundPortfolio.stocks[i]._id).shares;
                            totalValue += currentStock.l * foundPortfolio.stocks.id(foundPortfolio.stocks[i]._id).shares;
                            //foundPortfolio.save();    
                        }
                    }
                    
                    Portfolio.findOneAndUpdate(
                        {"_id": foundPortfolio._id },
                        { 
                            "$set": {
                                "totalValue"           : totalValue,
                                "totalGainLoss"        : totalValue - foundPortfolio.totalBuy,
                                "totalGainLossPercent" : (totalValue - foundPortfolio.totalBuy) / foundPortfolio.totalBuy * 100
                            }
                        },
                        function(err,doc) {
                            if(err){
                                console.log("Error while update portfolio value" + err);
                                callback(err);
                            } else {
                                console.log("AFTER!!!");
                                callback(null);
                            }
                        }
                    );
                    
                });
            } else {
                console.log("Empty stocks!!!");
                callback(null);
            }    
        }
        
    });
}

// Check portfolio ownership, will allow view example portfolio
function checkPortfolioOwnershipShow(req, res, next){
    // Check if user is logged in
    var id = req.params.id;
    Portfolio.findById(id,function(err, foundPortfolio){
        if(err){
            res.status(400).send("Portfolio cannot be found");
        }
       // Check if user owner of the portfolio
       else if(foundPortfolio){
            if(req.isAuthenticated()){
                if(foundPortfolio.owner == req.user.username){
                    next();
                } else {
                    //console.log(foundPortfolio.owner);
                    res.status(400).send("Unauthorized");        
                }
            }
            // Check if the user owner want to see example portfolio
            else if(foundPortfolio.name == 'example'){
                next();
            } else {
                res.status(400).send("Unauthorized");
            } 
       }
       else if(!foundPortfolio){
           res.status(400).send("Portfolio does not exist");
       }
        else {
            res.status(400).send("Unauthorized");
        } 
    });
}

// Check portfolio ownership, won't allow change example portfolio
function checkPortfolioOwnershipChange(req, res, next){
    // Check if user is logged in
    var id = req.params.id;
    Portfolio.findById(id,function(err, foundPortfolio){
        if(err){
            res.status(400).send("Portfolio cannot be found");
        }
       // Check if user owner of the portfolio
       else if(foundPortfolio){
            if(req.isAuthenticated()){
                if(foundPortfolio.owner == req.user.username){
                    next();
                } else {
                    //console.log(foundPortfolio.owner);
                    res.status(400).send("Unauthorized");        
                }
            }
            else {
                res.status(400).send("Unauthorized");
            } 
       }
       else if(!foundPortfolio){
           res.status(400).send("Portfolio does not exist");
       }
        else {
            res.status(400).send("Unauthorized");
        } 
    });
}


// Function that checks if user is logged in
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    } else {
        res.status(401).send("User is not logged in");
    }
}

app.listen(process.env.PORT, process.env.IP, function(){
   console.log("MyPortfolio Web Server Has Started");
});    

