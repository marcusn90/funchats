var mongoose = require('mongoose');
var ChatSchema = new mongoose.Schema({
  created: {type : Date, default : Date.now},
  title: {type: String, default: '', trim : true},
  content: {type: String, default: '', trim : true},
  user: {type : mongoose.Schema.ObjectId, ref : 'User'},
  users: [{type : mongoose.Schema.ObjectId, ref : 'User'}]
});
mongoose.model('chat',ChatSchema);