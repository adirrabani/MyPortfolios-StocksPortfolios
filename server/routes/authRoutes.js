var express = require("express"),
    router  = express.Router(); 

var passport = require("passport"),
    User = require("../models/userSchema.js");


// Registration route (Using passport local strategy)
router.post("/register", function(req, res){
    var newUser = new User({username: req.body.username});
    //console.log(req.body);
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log("Error in registration - " + err.message);
            res.status(400).json(err.message);
        } else {
            //console.log(user);
            passport.authenticate("local")(req, res, function(){
                res.status(200).json(user);
            });    
        }
        
    });
});


// Login route
router.post("/login", passport.authenticate("local"), function(req, res){
    //console.log(req.user);
    res.json(req.user);
});

// Logout route
router.post("/logout", function(req, res){
    req.logout();
    res.sendStatus(200);
});

/*
// Check if user logged in route
router.get('/isLoggedIn', function(req, res){
    console.log("sss" + req.user);
    res.send(req.isAuthenticated() ? req.user : '0');
});
*/

module.exports = router;