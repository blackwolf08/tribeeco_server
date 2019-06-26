var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var User = require('../models/user');

passport.use(new GoogleStrategy({
    clientID: "159917687050-shr71p9hqa7nj14mogl42fa9mknnmrqd.apps.googleusercontent.com",
    clientSecret: "qoY4q8ED1HNj4GXOuG0cPnuA",
    callbackURL: "http://localhost:8000/login"
  },
  function(accessToken, refreshToken, profile, done) {
       User.findOrCreate({ userid: profile.id }, { name: profile.displayName,userid: profile.id }, function (err, user) {
         return done(err, user);
       });
  }
));

module.exports = passport;