var mongoose = require('mongoose');
var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true
  },
  nickname: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
});
mongoose.model('user', UserSchema);