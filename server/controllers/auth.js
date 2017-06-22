var passport = require("passport"),
    User = require("../models/userSchema.js");

// Handle user registration (Using passport local strategy) on POST
exports.user_registration_post = function(req, res){
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
};

// Handle user login on POST
exports.user_login_post = function(req, res){
    res.json(req.user);
};

// Handle user logout on POST
exports.user_logout_post = function(req, res){
    req.logout();
    res.sendStatus(200);
};