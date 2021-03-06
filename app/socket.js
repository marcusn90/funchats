
var sio = require('socket.io');
module.exports = function(server){
	var io = sio.listen(server);
	io.sockets.on('connection', function (socket) {
		console.log('socket connected');
		socket.on('addToGroup', function(data){
			socket.join(data);
		});
		socket.on('notifyall', function (data) {
			console.log('Notify ALL',data);
			socket.broadcast.to(data.chatid).emit('globalMsg','Someone sent: '+data);
		});
		socket.on('disconnect', function () {
			console.log('user disconnected');
		});
		socket.on('msg.toAll', function (data) {
			console.log('Notify ALL',data);
			data.date = new Date();
			socket.broadcast.to(data.chatid).emit('msg.toMe',data);
		});
		socket.on('msg.pushToAll', function (data) {
			console.log('Notify ALL',data);
			data.date = new Date();
			socket.broadcast.to(data.chatid).emit('msg.pushToMe',data);
		});
	});
}
