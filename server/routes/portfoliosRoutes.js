var express = require("express"); 
var router  = express.Router(); 

var Portfolio  = require("../models/portfolioSchema.js"),
    request    = require('request');

var portfoliosController = require("../controllers/portfolios.js");    


/* Get request to check if user is logged in */
router.get('/isLoggedIn', portfoliosController.is_loggedin_get);

/* GET request for list of all the portfolios */
router.get('/api/portfolios', portfoliosController.portfolios_list_get);

/* POST request to create new portfolio */
router.post('/api/portfolios', isLoggedIn, portfoliosController.portfolio_create_post);

/* GET request for specific portfolio */
router.get("/api/portfolios/:id", checkPortfolioOwnershipShow, portfoliosController.portfolio_specific_get);

/* DELETE request of specific portfolio */
router.delete("/api/portfolios/:id", checkPortfolioOwnershipChange, portfoliosController.portfolio_specific_delete);

/* GET request for stock in a specific portfolio */
router.get("/api/portfolios/:id/stocks/:stock_id", checkPortfolioOwnershipShow, portfoliosController.portfolio_stock_get);

/* POST request to add stock to existing portfolio */
router.post('/api/portfolios/:id/stocks', checkPortfolioOwnershipChange, portfoliosController.portfolio_stock_post);

/* PUT request to update stock in specific portfolio */
router.put("/api/portfolios/:id/stocks/:stock_id", checkPortfolioOwnershipChange, portfoliosController.portfolio_stock_put);

/* DELETE request of stock in specific portfolio */
router.delete("/api/portfolios/:id/stocks/:stock_id", checkPortfolioOwnershipChange, portfoliosController.portfolio_stock_delete);

/* GET request for specific portfolio value data (will be in used after adding a new stock) */
router.get("/api/portfolios/:id/value", checkPortfolioOwnershipChange, portfoliosController.portfolio_value_get);

// Redirecting all other requests to angular route component
 router.get('*', function(req, res) {
     var home = process.cwd();
    res.sendFile(home + '/public/index.html'); // load index.html file
});

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

module.exports = router;