var db = require('./config/db');
var mongoose = require('mongoose');
require('./app/models/user.js');
require('./app/models/chat.js');

mongoose.connection.on('error', console.error.bind(console,'connection error:'));
mongoose.connection.once('open',function(){ 
	console.log('CONNECTED') 	
});
var connUri = process.env.MONGOHQ_URL || db.url;
console.log(connUri);
mongoose.connect(connUri);
