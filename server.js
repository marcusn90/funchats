// modules =================================================
var express = require('express');
var app = express()
  , http = require('http')
  , server = http.createServer(app)
  ,	DB = require('./db_installer.js')
  , passport = require('./config/passport.js');


	// app.configure(function() {
	  app.use(express.static('public'));
	  // app.use(express.logger());
	  app.use(express.cookieParser());
	  app.use(express.bodyParser());
	  app.use(express.session({ secret: 'keyboard-cat' }));
	  app.use(passport.initialize());
	  app.use(passport.session());
	  app.use(app.router);
	// });

	// routes ==================================================
	require('./app/routes')(app); // configure our routes
	require('./app/socket')(server); // configure our sockets


	// start app ===============================================
	var port = Number(process.env.PORT || 5000);
	server.listen(port);										// startup our app at http://localhost:8080
	console.log('Magic happens on port ' + port); 			// shoutout to the user
	exports = module.exports = app; 						// expose app