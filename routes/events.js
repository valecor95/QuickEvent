const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const {ensureAuthenticated} = require('../helpers/auth');

//My events route
router.get('/myEvents', ensureAuthenticated, (req,res) => {
  res.render('events/myEvents');
})

//Create event route
router.get('/createEvent', ensureAuthenticated, (req,res) => {
  res.render('events/createEvent');
})

module.exports = router;
