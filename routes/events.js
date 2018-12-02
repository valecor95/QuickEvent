const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Event = mongoose.model('events');
const User = mongoose.model('users');
const {ensureAuthenticated} = require('../helpers/auth');


// My events route
router.get('/myEvents', ensureAuthenticated, (req,res) => {
  //find events created
  Event.find({
    creator: req.user.id
    })
    .sort({dateCreation:'desc'})
    .then(myevents => {

      //find events joined
      User.findOne({
         _id:req.user.id
      })
      .populate('events')
      .then(userfound => {

        //render both
        res.render('events/myEvents', {
          myevents:myevents,
          eventsjoined:userfound.events
        });
      })
    });
});

// Create event route
router.get('/createEvent', ensureAuthenticated, (req,res) => {
  res.render('events/createEvent');
})

// Show Single event
router.get('/show/:id', (req, res) => {
  Event.findOne({
    _id: req.params.id
    })
    .populate('creator')     //to access creator info
    .populate('comments.commentUser')
    .then(event => {
      res.render('events/show', {
        event:event
      });
    });
});

// List stories from a user
router.get('/user/:userId', (req, res) => {
  Event.find({
    creator: req.params.userId
    })
    .then(events => {
      res.render('events/userEvents', {
        events:events
      });
    });
});

// Edit Event form
router.get('/editEvent/:id', ensureAuthenticated, (req,res) => {
  Event.findOne({
    _id: req.params.id
    })
    .then(event => {
      res.render('events/editEvent', {
        event:event
      });
    });
})


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
      time: req.body.time,
      location: req.body.location,
      details: req.body.details,
    });
  } else{

    //create the new event object
    const newEvent = {
      name: req.body.name,
      date: req.body.date + ' ' + req.body.time,
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

//edit form Process
router.put('/:id', (req, res) => {
  Event.findOne({
    _id: req.params.id
    })
    .then(event => {
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
          time: req.body.time,
          location: req.body.location,
          details: req.body.details,
        });
      } else {

        //update values
        event.name = req.body.name,
        event.date = req.body.date + ' ' + req.body.time,
        event.location = req.body.location,
        event.details = req.body.details,
        event.creator = req.user.id

        event.save()
        .then(event => {
          req.flash('success_msg', 'Event updated');
          res.redirect('/events/myEvents');
        })
      }
    });
});


// Add Comment
router.post('/comment/:id', (req, res) => {
  Event.findOne({
    _id: req.params.id
    })
    .then(event => {
      const newComment = {
        commentBody: req.body.commentBody,
        commentUser: req.user.id
      }

      // Add to comments array (use unshift instead of push to put at the top)
      event.comments.unshift(newComment);

      event.save()
        .then(event => {
          res.redirect(`/events/show/${event.id}`);
        });
    });
});


//join event Process
router.put('/join/:id', (req, res) => {
  Event.findOne({
    _id: req.params.id
    })
    .then(event => {
      //check if already joined
      User.findOne({
        _id: req.user.id
      })
      .then(user => {
        if (user.events.indexOf(event._id) != -1){
          req.flash('error_msg', 'Already joined');
          res.redirect('/events/myEvents');
        } else {

          //to add in both user (events) list and event (joiners) list
          event.joiners.push(req.user.id);
          user.events.unshift(event);
          user.save()

          event.save()
            .then(event => {
              req.flash('success_msg', 'Event joined');
              res.redirect('/events/myEvents');
            });
        }
      });
    });
});


//leave event Process
router.put('/delete/:id', (req, res) => {
  //to delete user in event (joiners) list
  Event.findOne({
    _id: req.params.id
    })
    .then(event => {
      event.joiners.pull(req.user.id);

      //to delete also in the user (events) list
      User.findOne({
          _id: req.user.id
        })
        .then(user => {
          user.events.pull(event);
          user.save()
        });

      event.save()
        .then(event => {
          req.flash('error_msg', 'Event left');
          res.redirect('/events/myEvents');
        });

    });
});


//delete event
router.delete('/:id', (req, res) => {
  User.update({}, {
    $pull: {events:req.params.id}
  });

  Event.deleteOne({
    _id: req.params.id
    })
    .then(() => {
      req.flash('error_msg', 'Event removed');
      res.redirect('/events/myEvents');
    });
});


module.exports = router;
