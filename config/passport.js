const DropboxOAuth2Strategy = require('passport-dropbox-oauth2').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const keys = require('./keys.js');
const bcrypt = require('bcryptjs');

const User = mongoose.model('users');

module.exports = function(passport){
  //to access by form
  passport.use('local',
      new LocalStrategy({usernameField: 'email'}, (email, password, done) => {
      // Match user
      User.findOne({
        email:email
      }).then(user => {
        if(!user){
          return done(null, false, {message: 'No User Found'});
        }

        // Match password
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if(err) throw err;
          if(isMatch){
            return done(null, user);
          } else {
            return done(null, false, {message: 'Password Incorrect'});
          }
        })
      })
    }));

    //to access by github
    passport.use('dropbox-oauth2',
    new DropboxOAuth2Strategy({
      apiVersion: '2',
      clientID: keys.dropbox_appID,
      clientSecret:keys.dropbox_appSecret,
      callbackURL:'/auth/dropbox/callback'
    }, (accessToken, refreshToken, profile, done) => {

      const newUser = {
        dropboxID: profile.id,
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        email: profile.emails[0].value
      }

      // Check for existing user
      User.findOne({
        email:profile.emails[0].value
      }).then(user => {
        if(user){
          // Return user
          done(null, user);
        } else {
          // Create user
          new User(newUser)
            .save()
            .then(user => done(null, user));
        }
      })
    })
  );

  //to access by google
  passport.use('google',
    new GoogleStrategy({
      clientID: keys.google_clientID,
      clientSecret:keys.google_clientSecret,
      callbackURL:'/auth/google/callback',
      proxy: true
    }, (accessToken, refreshToken, profile, done) => {

      const newUser = {
        googleID: profile.id,
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        email: profile.emails[0].value,
      }

      // Check for existing user
      User.findOne({
        email:profile.emails[0].value
      }).then(user => {
        if(user){
          // Return user
          done(null, user);
        } else {
          // Create user
          new User(newUser)
            .save()
            .then(user => done(null, user));
        }
      })
    })
  );



  passport.serializeUser(function(user, done) {
      done(null, user._id);
  });

  passport.deserializeUser(function(id, done) {
      User.findById(id, function(err, user) {
          done(err, user);
      });
  });
}
