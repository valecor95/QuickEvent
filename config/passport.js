const FacebookStrategy 	= require('passport-facebook').Strategy;
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

    //to access by facebook
    passport.use('facebook', new FacebookStrategy({
        clientID        : keys.facebook_appID,
        clientSecret    : keys.facebook_appSecret,
        callbackURL     : "/auth/facebook/callback",
        profileFields   : ['id','emails','name']
        },
        // facebook will send back the tokens and profile
        function(access_token, refresh_token, profile, done) {
            // asynchronous
            process.nextTick(function() {
                //console.log(profile);
                //console.log(profile.id);

                // find the user in the database based on their email
                User.findOne({ email:profile.emails[0].value
                    }, function(err, user) {

                    // if there is an error, stop everything and return that
                    // ie an error connecting to the database
                    if (err)
                    return done(err);

                    // if the user is found, then log them in
                    if (user) {
                        user.online = true;
                        return done(null, user); // user found, return that user
                    } else {
                        // if there is no user found with that facebook id, create them
                        console.log("NOTFOUND");
                        var newUser = new User();

                        // set all of the facebook information in our user model
                        newUser.facebook_access_token = access_token; // we will save the token that facebook provides to the user
                        newUser.firstName  = profile.name.givenName;
                        newUser.google_ac_token="";
                        newUser.lastName = profile.name.familyName; // look at the passport user profile to see how names are returned
                        newUser.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first
                        //newUser.feedback=0;
                        //newUser.num_recensioni=0;
                        //newUser.somma_valutazione=0;
                        //newUser.eventi=[];
                        newUser.online=true;

                        // save our user to the database
                        newUser.save(function(err) {
                            if (err) throw err;

                            // if successful, return the new user
                            return done(null, newUser);
                        });
                    }
                });
            });
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
      //console.log(accessToken);
      //console.log(profile);

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
      //console.log('serializing user: ');
      //console.log(user);
      done(null, user._id);
  });

  passport.deserializeUser(function(id, done) {
      User.findById(id, function(err, user) {
          //console.log('deserializing user:',user);
          done(err, user);
      });
  });
}