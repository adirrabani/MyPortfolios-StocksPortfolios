var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

// Schema setup
var UserSchema = new mongoose.Schema({
   username: String,
   password: String
});

UserSchema.plugin(passportLocalMongoose);

// Compile all into a module and export
var User = mongoose.model("User",UserSchema);
module.exports = User;