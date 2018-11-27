const FacebookStrategy 	= require('passport-facebook').Strategy;
const keys = require('./keys.js');
const mongoose = require('mongoose');

const User = mongoose.model('users');

module.exports = function(passport){
    passport.use('facebook', new FacebookStrategy({
        clientID        : keys.facebook_appID,
        clientSecret    : keys.facebook_appSecret,
        callbackURL     : "http://localhost:5000/facebook/callback",
        profileFields   : ['id','emails','name']
        },
        // facebook will send back the tokens and profile
        function(access_token, refresh_token, profile, done) {
            // asynchronous
            process.nextTick(function() {
                console.log(profile);
                console.log(profile.id);
  
                // find the user in the database based on their facebook id
                User.findOne({ 'id' : profile.id }, function(err, user) {
  
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
                        newUser.id    = profile.id; // set the users facebook id
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
    passport.serializeUser(function(user, done) {
        console.log('serializing user: ');
        console.log(user);
        done(null, user._id);
    });
    
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            console.log('deserializing user:',user);
            done(err, user);
        });
    });
}