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
    
var routes   = require("./routes.js");
  
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

// Use routes file ("./routes.js")
app.use(routes);

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
    
var routes   = require("./routes.js");
  
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

// Use routes file ("./routes.js")
app.use(routes);

// Start the application
app.listen(process.env.PORT, process.env.IP, function(){
   console.log("MyPortfolio Web Server Has Started");
});    

