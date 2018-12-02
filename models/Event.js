const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Event Schema
const EventSchema = new Schema({
  name:{
    type: String,
    required: true
  },
  date:{
    type: Date,
    required: true
  },
  location: {
    type: String,
    default: Date.now
  },
  details:{
    type: String,
    default: 'No details for this event'
  },
  creator:{
    type: Schema.Types.ObjectId,
    ref:'users'
  },
  joiners:[{
    user:{
      type: Schema.Types.ObjectId,
      ref:'users'
    }
  }],
  comments: [{
    commentBody: {
      type: String,
      required: true
    },
    commentDate:{
      type: Date,
      default: Date.now
    },
    commentUser:{
      type: Schema.Types.ObjectId,
      ref:'users'
    }
  }],
  dateCreation:{
    type: Date,
    default: Date.now
  }
});

mongoose.model('events', EventSchema);
