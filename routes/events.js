const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Event = mongoose.model('events');
const User = mongoose.model('users');
const {ensureAuthenticated} = require('../helpers/auth');
const amqp = require('amqplib/callback_api');
const keys = require('../config/keys.js');


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

// List events from a user
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
        res.redirect('/events/myEvents');
      })
    // Send a notify to all users
    amqp.connect(keys.amqpURI, function(err, conn) {
      conn.createChannel(function(err, ch) {
        var ex = 'notify';
        var key = "all";
        var msg = "The event '"+ req.body.name + "' has been created";
        ch.assertExchange(ex, 'topic', {durable: false});
        ch.publish(ex, key, new Buffer.from(msg));
      });
      setTimeout(function() { conn.close();}, 500);
    });
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

        for(i = 0; i < event.joiners.length; i++){
          User.findOne({
            _id: event.joiners[i]._id
          }).then(user => {
            // Send a notify to all joiners
            amqp.connect(keys.amqpURI, function(err, conn) {
              conn.createChannel(function(err, ch) {
                var ex = 'notify';
                var key = user.email;
                var msg = "The event '" + req.body.name + "' has been edited";
                ch.assertExchange(ex, 'topic', {durable: false});
                ch.publish(ex, key, new Buffer.from(msg));
              });
              setTimeout(function() { conn.close();}, 500);
            });
          });
        }

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
          user.save();

          //to send a notify to event's creator
          User.findOne({
            _id: event.creator._id
          })
          .then(user2 => {
            // Send a notify to event's creator
            amqp.connect(keys.amqpURI, function(err, conn) {
              conn.createChannel(function(err, ch) {
                var ex = 'notify';
                var key = user2.email;
                var msg = req.user.firstName + " " + req.user.lastName + " has joined your event '" + event.name + "'";
                ch.assertExchange(ex, 'topic', {durable: false});
                ch.publish(ex, key, new Buffer.from(msg));
              });
              setTimeout(function() { conn.close();}, 500);
            });
          });

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
          user.save();
        });

      //to send a notify to event's creator
      User.findOne({
          _id: event.creator._id
        })
        .then(user => {
          // Send a notify to event's creator
          amqp.connect(keys.amqpURI, function(err, conn) {
            conn.createChannel(function(err, ch) {
              var ex = 'notify';
              var key = user.email;
              var msg = req.user.firstName + " " + req.user.lastName + " has left your event '" + event.name + "'";
              ch.assertExchange(ex, 'topic', {durable: false});
              ch.publish(ex, key, new Buffer.from(msg));
            });
            setTimeout(function() { conn.close();}, 500);
          });
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
  /*
  Event.findOne({
    _id: req.params.id
    })
    .then(event =>{
      for(i = 0; i < event.joiners.length; i++){
        User.findOne({
          _id: event.joiners[i]._id
        }).then(user => {
          // Send a notify to all joiners
          amqp.connect(keys.amqpURI, function(err, conn) {
            conn.createChannel(function(err, ch) {
              var ex = 'notify';
              var key = user.email;
              var msg = "ATTENTION: the event that you're joined " + event.name + " has been canceled";
              ch.assertExchange(ex, 'topic', {durable: false});
              ch.publish(ex, key, new Buffer.from(msg));
            });
            setTimeout(function() { conn.close();}, 500);
          });
        });
      }
    });
    */
  Event.deleteOne({
    _id: req.params.id
    })
    .then(event => {
      req.flash('error_msg', 'Event removed');
      res.redirect('/events/myEvents');
    });
});


module.exports = router;
