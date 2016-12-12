var mongoose = require("mongoose");


// Dividends schema setup
var Dividends = new mongoose.Schema({
   dividendDate : {type: Date},
   dividend     : {type: Number, min: 0}
});

// Stocks schema setup
var Stocks = new mongoose.Schema({
   symbol          : {type: String, required: true},
   buyDate         : {type: Date, default: null},
   price           : {type: Number, min: 0},
   //shares        : {type: Number, validate : [function(shares) { return shares > 0; }, "Number of shares has to be a positive number"]},
   shares          : {type: Number, min: 0},
   lastPrice       : {type: Number, default: null},
   change          : {type: Number, default: null},
   changePercent   : {type: Number, default: null},
   gainLoss        : {type: Number, default: null},
   gainLossPercent : {type: Number, default: null},
   value           : {type: Number, default: null},
   updateTime      : String,
   dividends       : [Dividends],
   totalDividends  : {type: Number, min: 0}
});

// Portfolio schema setup
var portfolioSchema = new mongoose.Schema({
   name                 : String,
   owner                : String,
   totalBuy             : {type: Number, default: 0},
   totalValue           : {type: Number, default: null},
   totalGainLoss        : {type: Number, default: null},
   totalGainLossPercent : {type: Number, default: null},
   stocks               : [Stocks]
});

// Compile it into a module and export
var Portfolio = mongoose.model("Portfolio",portfolioSchema);
module.exports = Portfolio;