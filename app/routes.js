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
	app.get('/profile/:prof_id',function(req,res){
		console.log(req.params.prof_id);
		// console.log(req.user.nickname + ' ' + req.user._id);
		User.findById(req.params.prof_id,function(err,prof){
			console.log('prof:',prof);
			if(err){ return res.send(err); }
			jade.renderFile('./public/jade/profile.jade',{theuser:req.user,theprofile:prof},function(err,html){
				if(err){
					res.send(err);
				}
				if(html){
					res.send(html);
				}
			});
		});
	});
	app.get('/add/profile/:profile_id/to/chat/:chat_id',function(req,res){
		var pId = req.params.profile_id;
		var cId = req.params.chat_id;
		if(pId && cId)
			console.log('ADD USER');
			console.log(req.params.profile_id);
			console.log('TO CHAT');
			console.log(req.params.chat_id);
			User.findById(pId,function(err,doc){
				if(err || !doc){
					return res.send('Trying to add not existing profile');
				}
				Chat.findById(cId,function(err,doc){
					if(err || !doc){
						return res.send('Trying to add to not existing chat');
					}
					doc.users.push(pId);
					doc.save(function(err){
						if(err){
							return res.send('Error while saving new profile to chat');
						}
						return res.redirect('/chat/'+cId);
					});
				});
			});
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

			/* map reduce to get user -> chats */
			var mrConf = {
				map:function(){
					for(var i in this.users){
						emit(this.users[i],{id:this._id,title:this.title,userscount:this.users.length});
					}
				},
				reduce:function(k,v){
					var result = {chats:[]};
					for(var i in v){result.chats.push(v[i])}
					return result;
				}
			}
			
			// var promise = Chat.mapReduce(mrConf);
			// promise.then(function(data){});
			Chat.mapReduce(mrConf,function(err,data){
				console.log(data);
				var userChats = data.filter(function(item){
					return item._id == req.user.id;
							});
				if(userChats.length){
					return res.send(userChats[0].value.chats);
				} else {
					return res.send('');
				}
				
				
			});
		}else{
			res.send('');
		}
		// 	Chat.find({'user':req.user.id},function(err,data){
		// 	  	if(err){
		// 	  		console.log(err);
		// 	  		res.send(err);
		// 	  	}else{
		// 	  		res.send(data);
		// 	  	}
		// 	  });
		// }else{
		// 	res.send('');
		// }
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