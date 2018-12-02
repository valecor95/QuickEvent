const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const router = express.Router();
const {ensureAuthenticated} = require('../helpers/auth');

//load user module
require('../models/User');
const User = mongoose.model('users');

//log-in routes
router.get('/login', (req,res) =>{
  res.render('auth/login');
});

//sign-up routes
router.get('/register', (req,res) =>{
  res.render('auth/register');
});

//user page routes
router.get('/userPage', ensureAuthenticated, (req,res) =>{
  res.render('auth/userPage');
});


//login Form
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/auth/login',
    failureFlash: true
  })(req,res, next);
});


//register Form
router.post('/register', (req, res) => {
  let errors = [];

  if(req.body.password != req.body.password2){
    errors.push({text:'Passwords do not match'});
  }

  if(req.body.password.length < 6){
    errors.push({text:'Password must be at least 6 characters'});
  }

	//server side validation
  if(errors.length > 0){
    res.render('auth/register', {
      errors: errors,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email
      //password cleared
    });
  } else{
    User.findOne({email: req.body.email})       //to check if email already in
      .then(user =>{
        if(user){
          req.flash('error_msg', 'Email already used');
          res.redirect('/auth/register');
        } else{
          const newUser = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: req.body.password
          });
          bcrypt.genSalt(10, (err,salt) => {			//password crypting
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if(err) throw err;
              newUser.password = hash;
              newUser.save()
                .then(user => {
                  req.flash('success_msg', 'You are now registered, please log-in');
                  res.redirect('/auth/login');
                })
                .catch(err => {
                  console.log(err);
                  return;
                })
            });
          });
        }
      });
  }
});



//FACEBOOK authentication routes
router.get('/facebook',
	  passport.authenticate('facebook', {scope : ['email'] })
);

//return from authenticate
router.get('/facebook/callback',
	passport.authenticate('facebook', {
	    successRedirect : '/',
	    failureRedirect : '/auth/login'
	})
);



//GOOGLE authentication
router.get('/google', passport.authenticate('google', {scope: ['profile', 'email']}));

//return from authenticate
router.get('/google/callback',
  passport.authenticate('google', {
    successRedirect : '/',
    failureRedirect: '/auth/login'
    })
  );



// logout user
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'Logged out')
  res.redirect('/auth/login');
});

module.exports = router;
