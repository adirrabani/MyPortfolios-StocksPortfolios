var http       = require('http'),
    async = require("async"),
    mongoose   = require("mongoose"),
    Portfolio  = require("./portfolioSchema.js"),
    dividendsData  = require("./dividendsData.js");

mongoose.createConnection("mongodb://adirke:adirke@ds159237.mlab.com:59237/portfoliosapp");

// Get all portfolios
Portfolio.find({}, function(err, allPortfolios){
    if(err){
        console.log("error from DB GET");
    } else {
        // Pass on each portfolio
        for(var i=0; i<allPortfolios.length; i++){
            // Pass on each stock in specific portfolio
            for(var j=0; j<allPortfolios[i].stocks.length; j++){
                // Fetch dividend information for each stock
                dividendsData.fetchDividendData(allPortfolios[i].stocks[j], function(sym, ret){
                    console.log("Dividens fetch has ended - " + sym);
                });
            }    
        }
    }
});
/*
function fetchDividendData (portfolioId, stock, callback) {
    if ((typeof(stock.symbol) !== 'undefined') && (stock !== null) && (stock.symbol.length > 0)){
        var csvData = '';
        
        // Defining date range (butDate --> Today)
        var a = (stock.buyDate.getMonth());
        var b = (stock.buyDate.getUTCDate());
        var c = (stock.buyDate.getUTCFullYear());
        
        var today = new Date();
        var d = (today.getMonth());
        var e = (today.getUTCDate());
        var f = (today.getUTCFullYear());
        
        var dateRange = ("&a="+a+"&b="+b+"&c="+c+"&d="+d+"&e="+e+"&f="+f);
        
        // URL of Yahoo API (gives us dividends data)
        //var url = "http://real-chart.finance.yahoo.com/table.csv?s=" + symbol + "&a=00&b=1&c=1900&d=11&e=31&f=2020&g=v&ignore=.csv";
        var url = "http://real-chart.finance.yahoo.com/table.csv?s=" + stock.symbol + dateRange +"&g=v&ignore=.csv";
        
        var request = http.get(url, function (res) {
            res.on('data', function (chunk) {
                csvData += chunk;
            });
            res.on('end', function () {
                var tmpDividend = [];

                var csvDataInLines = csvData.split('\n').reverse();
                for (var i = 1; i < csvDataInLines.length - 1; i++) {
                    var details = csvDataInLines[i].split(',');
                    
                    var tmpDate = details[0];
                    var tmpAmount = details[1];
                    // Add all the dividends to temp array (tmpDividend)
                    tmpDividend.push({
                        dividendDate: tmpDate,
                        dividend: tmpAmount
                    });
                };
                //console.log(stock.symbol);
                //console.log(tmpDividend);
                
                // Updates DB with dividends data for a specific stock
                Portfolio.findOneAndUpdate(
                    {"stocks._id": stock._id },
                    { 
                        "$set": {
                            "stocks.$.dividends": tmpDividend
                        }
                    },
                    function(err,doc) {
                        if(err){
                            console.log("Error while trying get dividend data" + err);
                        }
                    }
                );
                callback(stock.symbol, tmpDividend);
                
            });
        });
    } else {
        console.error('Symbol is incorrect!');
        return null;
    }       

}*/