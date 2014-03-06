var jade = require('jade');
var passport = require('passport')
  , mongoose = require('mongoose');

var User = mongoose.model('user');
var Chat = mongoose.model('chat');

module.exports = function(app){
	app.get('/',function(req,res){
		if(req.isAuthenticated()){
			res.redirect('/account');
		}else{
			// console.log(req.user);
			jade.renderFile('./public/jade/home.jade',{theuser:req.user},function(err,html){
				if(err){ res.send(err);}
				if(html){res.send(html);}
			});
		}
	});
	app.get('/getstarted',function(req,res,next){
		if(req.isAuthenticated()){
			res.redirect('/');
		}else{
			jade.renderFile('./public/jade/login.jade',{},function(err,html){
				if(err){
					res.send(err);
				}
				if(html){
					res.send(html);
				}
			});
		}
	});
	app.get('/account',function(req,res){
		if(!req.isAuthenticated()){
			res.redirect('/getstarted');
		}else{
			// console.log(req.user);
			jade.renderFile('./public/jade/account.jade',{theuser:req.user},function(err,html){
				if(err){
					res.send(err);
				}
				if(html){
					res.send(html);
				}
			});
		}
	});
	app.get('/chat/:chat_id',function(req,res){
		if(!req.isAuthenticated()){
			res.redirect('/getstarted');
		}else{
			console.log(req.params.chat_id);
			console.log(req.user.nickname + ' ' + req.user._id);
			Chat.findById(req.params.chat_id,function(err,chat){
				console.log('Chat:',chat);
				if(err){ return res.send(err); }
				
				//if( chat.user.equals(req.user._id) ){// - user is chat owner
				if ( chat.users.some(function(u){ return u.equals(req.user._id); }) ) {
					jade.renderFile('./public/jade/chat.jade',{theuser:req.user,chatId:chat._id},function(err,html){
						if(err){
							res.send(err);
						}
						if(html){
							res.send(html);
						}
					});
				}else{
					return res.redirect('/account');
				}
			});
		}
	});

	app.post('/login', function(req, res, next) {
	  passport.authenticate('local',
	    function(err, user, info) {
	      if(err){
	      	return next(err);
	      }
	      if(!user){
	      	return res.redirect('/getstarted');
	      }
	      console.log('USER TO LOG IN: ',user);
	      req.logIn(user, function(err) {
	        return err ? next(err) : res.redirect('/');
	      });
	    })(req, res, next);
	});

	app.post('/signup', function(req, res, next) {
	  var user = new User({ email: req.body.email, password: req.body.password, nickname:req.body.nickname });
	  console.log(user);
	  user.save(function(err) {
	    return err? next(err):req.logIn(user, function(err) {
							        return err
							          ? next(err)
							          : res.redirect('/');
							      });
	  });
	});

	app.get('/logout', function(req, res){
	  req.logout();
	  res.redirect('/getstarted');
	});

	app.get('/loginfail',function(req,res){res.send('login fail');});

	app.post('/newchat',function(req,res,next){
		if(req.isAuthenticated()){
			var chat = new Chat({user:req.user,title:req.body.chattitle});
			chat.users.push(req.user);
			chat.save(function(err){
				if(err){
					return next(err);
				}else{
					return res.redirect('/');
				}
			});
		}else{
			res.redirect('/');
		}
	});

	app.get('/_api/users',function(req,res){
		if( req.isAuthenticated() ){
			User.where('_id').ne(req.user.id)
			  .exec(function(err,data){
			  	if(err){
			  		console.log(err);
			  		res.send(err);
			  	}else{
			  		res.send(data);
			  	}
			  });
		}else{
			res.send('');
		}
	});

	app.get('/_api/chats',function(req,res){
		if( req.isAuthenticated() ){
			Chat.find({'user':req.user.id},function(err,data){
			  	if(err){
			  		console.log(err);
			  		res.send(err);
			  	}else{
			  		res.send(data);
			  	}
			  });
		}else{
			res.send('');
		}
	});
	app.get('/_api/thechat/:chat_id',function(req,res){
		if( req.isAuthenticated() ){
			Chat.findById(req.params.chat_id,function(err,chat){
				console.log('ANG init Chat:',chat);
				if(err){ 
					res.send(err);
				//} else if ( chat.user.equals(req.user._id) ){ - user is chat owner
				} else if ( chat.users.some(function(u){ return u.equals(req.user._id); }) ){
					res.send(chat);
				}else{
					res.send('');
				}
			});
		}else{
			res.send('');
		}
	});
}