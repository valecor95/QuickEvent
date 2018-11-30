const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Event = mongoose.model('events');


//index route
router.get('/', (req,res) => {
  Event.find({})                        //show every event in the database
    .sort({dateCreation:'desc'})
    .then(events => {
      res.render('index/home', {
        events:events
      });
    });
})

//about route
router.get('/about', (req,res) => {
  res.render('index/about');
})

module.exports = router;
