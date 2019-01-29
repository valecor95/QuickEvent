const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// User Schema
const UserSchema = new Schema({
  email:                  { type: String, required: true },
  dropboxID:               { type: String, required: false },
  googleID:               { type: String, required: false },
  firstName:              { type: String, required: true },
  lastName:               { type: String, required: true },
  password:               { type: String, required: false },
  date:                   { type: Date, default: Date.now },
  events:                 [{ type: Schema.Types.ObjectId, ref:'events'}]
});

mongoose.model('users', UserSchema);
