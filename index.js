require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose');
const findOrCreate = require('mongoose-findorcreate')
const passport = require('passport')
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require("express-session")
const cors = require('cors')
const UserModel = require("./models/UserData")
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcrypt');
const saltRounds = 10;

const app = express();

mongoose.connect(
    `${process.env.START_MONGODB}`,
    {
    useNewUrlParser:true,
    useUnifiedTopology:true
    }, () =>{
        console.log("Connected To Mongoose Successfully!");
    }
);

//Middleware
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000", credentials:true }))
app.set("trust proxy", 1);

app.use(
    session({
        secret: "secretcode",
        resave:true,
        saveUninitialized:true,
        cookie:{
          sameSite: "none",
          secure:true,
          maxAge:1000 * 60 * 60 * 24 * 7  //one week
        }
    })
);
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());


passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    UserModel.findById(id, function(err, user) {
      done(err, user);
    });
  });

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "/auth/google/opendevcons",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
      console.log(profile);
    UserModel.findOrCreate({ googleId: profile.id, email:profile.emails[0].value}, function (err, user) {
      return cb(err, user);
    });
  }
));

app.get("/", function(req,res){
  res.send("hello desh")
})

app.get("/auth/google",
  passport.authenticate('google', { scope: ['profile','email'] }));

app.get("/auth/google/opendevcons", 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('http://localhost:3000');
  });

  

  app.get("/getuser", function(req,res){
    res.send(req.user);
  })

  app.get("/auth/logout", function(req,res){
    if(req.user){
      req.logout();
      res.send("done");
    }
    
  })
 

app.listen(process.env.PORT || 4000, ()=>{
    console.log('Server is Running on Port 4000');
})