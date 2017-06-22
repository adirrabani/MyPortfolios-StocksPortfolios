var express    = require("express"),
    app        = express(),
    bodyParser = require("body-parser"),
    mongoose   = require("mongoose"),

    User = require("./server/models/userSchema.js"),
    //dividendsData  = require("./dividendsData.js"),
    passport = require("passport"),
    LocalStrategy = require("passport-local").Strategy,
    cookieParser = require('cookie-parser');
    
//var routes   = require("./routes.js");
var authRoutes = require("./server/routes/authRoutes.js");
var portfoliosRoutes = require("./server/routes/portfoliosRoutes.js");

// Use routes file ("./routes.js")
//app.use(authRoutes);
  
app.use(bodyParser.urlencoded({extended: true}));
app.set('views', __dirname + '/public/views');
app.use(express.static(__dirname + '/public'));
console.log(process.env.DBURL);

// mongoose.createConnection(process.env.DBURL);
mongoose.connect(process.env.DBURL);
var db = mongoose.connection;

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
app.use(portfoliosRoutes);
app.use(authRoutes);

// Start the application
app.listen(process.env.PORT, process.env.IP, function(){
   console.log("MyPortfolio Web Server Has Started");
});    
