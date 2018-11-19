const express = require('express');
//const mongoose = require('mongoose');
const router = express.Router();

//My events route
router.get('/myEvents', (req,res) => {
  res.render('events/myEvents');
})

//Create event route
router.get('/createEvent', (req,res) => {
  res.render('events/createEvent');
})

module.exports = router;
