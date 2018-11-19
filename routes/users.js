const express = require('express');
//const mongoose = require('mongoose');
const router = express.Router();

//log in routes
router.get('/login', (req,res) =>{
  res.render('users/login');
});

//sign up routes
router.get('/register', (req,res) =>{
  res.render('users/register');
});


module.exports = router;
