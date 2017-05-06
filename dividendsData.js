var http       = require('http'),
    mongoose   = require("mongoose"),
    Portfolio  = require("./portfolioSchema.js");

mongoose.connect("mongodb://adirke:adirke@ds159237.mlab.com:59237/portfoliosapp");

function fetchDividendData (stock, callback) {
    if ((typeof(stock.symbol) !== 'undefined') && (stock !== null) && (stock.symbol.length > 0)){
        var csvData = '';
        var totalDiv = 0;
        
        // Defining date range (butDate --> Today)
        var a = (stock.buyDate.getMonth());
        var b = (stock.buyDate.getUTCDate());
        var c = (stock.buyDate.getUTCFullYear());
        
        var today = new Date();
        var d = (today.getMonth());
        var e = (today.getUTCDate());
        var f = (today.getUTCFullYear());
        
        var dateRange = ("&a="+a+"&b="+b+"&c="+c+"&d="+d+"&e="+e+"&f="+f);
        
        // Yahoo API URL (for dividends data), CSV format
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
                                        
                    // Calculate total dividends income
                    totalDiv += Number(tmpAmount);
                    //console.log(tmpAmount);
                    
                    // Add all the dividends to temp array (tmpDividend)
                    tmpDividend.push({
                        dividendDate: tmpDate,
                        dividend: tmpAmount
                    });
                };
                //console.log(stock.shares);
                
                totalDiv = totalDiv * stock.shares;
                //console.log(totalDiv);
                
                // Updates DB with dividends data for a specific stock
                Portfolio.findOneAndUpdate(
                    {"stocks._id": stock._id },
                    { 
                        "$set": {
                            "stocks.$.dividends"     : tmpDividend,
                            "stocks.$.totalDividends": totalDiv
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
        console.error('Symbol is incorrect! - ' + stock);
        console.error(stock);
        return null;
    }       

}

module.exports = {
  fetchDividendData: fetchDividendData
};