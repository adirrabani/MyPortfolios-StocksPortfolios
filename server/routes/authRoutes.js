var express = require("express"),
    router  = express.Router(); 

var passport = require("passport");

var authController = require("../controllers/auth.js");

/* POST request for user registration */
router.post("/register", authController.user_registration_post);

/* Post request for user login */
router.post("/login", passport.authenticate("local"), authController.user_login_post);

// Logout route
router.post("/logout", authController.user_logout_post);

/*
// Check if user logged in route
router.get('/isLoggedIn', function(req, res){
    console.log("sss" + req.user);
    res.send(req.isAuthenticated() ? req.user : '0');
});
*/

module.exports = router;