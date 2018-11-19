const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const EventSchema = new Schema({
  name:{
    type: String,
    required: true
  },
  date:{
    type: Date,
    required: true
  },
  time:{
    type: Time,
    required: true
  },
  location: {
    type: string,
    default: Date.now
  }
});

mongoose.model('events', EventSchema);
