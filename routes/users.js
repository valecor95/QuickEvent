const express = require('express');
const router = express.Router();
const passport = require('passport');

//log in routes
router.get('/login', (req,res) =>{
  res.render('users/login');
});

//sign up routes
router.get('/register', (req,res) =>{
  res.render('users/register');
});

module.exports = router;
