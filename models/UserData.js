const mongoose = require('mongoose');
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require('mongoose-findorcreate')


const UserSchema = new mongoose.Schema({
   email:{type: String},
   name: {type:String},
   password :{type:String},
   googleId: {type:String}
});

UserSchema.plugin(passportLocalMongoose);
UserSchema.plugin(findOrCreate);


const User = mongoose.model("User",UserSchema);

module.exports = User;