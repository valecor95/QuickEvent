const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Event = mongoose.model('events');
const User = mongoose.model('users');
const {ensureAuthenticated} = require('../helpers/auth');

//My events route
router.get('/myEvents', ensureAuthenticated, (req,res) => {
  Event.find({creator: req.user.id})
    .sort({dateCreation:'desc'})
    .then(myevents => {
      res.render('events/myEvents', {
        myevents:myevents
      });
    });
})

//Create event route
router.get('/createEvent', ensureAuthenticated, (req,res) => {
  res.render('events/createEvent');
})

// Show Single evnet
router.get('/show/:id', (req, res) => {
  Event.findOne({
    _id: req.params.id
  })
  .populate('creator')     //to access creator info
  .then(event => {
    res.render('events/show', {
      event:event
    });
  });
});


// Process Add Event
router.post('/createEvent', (req, res) => {
  let errors = [];;

  //server side validation
  if(!req.body.name){
    errors.push({text:'Please add the name'});
  }
  if(!req.body.date){
    errors.push({text:'Please add the date'});
  }
  if(!req.body.time){
    errors.push({text:'Please add the time'});
  }
  if(!req.body.location){
    errors.push({text:'Please add the location'});
  }

  if(errors.length > 0){
    res.render('events/createEvent', {
      errors: errors,
      name: req.body.name,
      date: req.body.date,
      //time                  ////////
      location: req.body.location,
      details: req.body.details,
    });
  } else{

    const newEvent = {
      name: req.body.name,
      date: req.body.date,
      //time
      location: req.body.location,
      details: req.body.details,
      creator: req.user.id
    }
    new Event(newEvent)
      .save()
      .then(event => {
        req.flash('success_msg', 'Event added');
        res.redirect('/events/myEvents');
      })
  }

});

module.exports = router;
