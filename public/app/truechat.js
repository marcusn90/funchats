var Socket = io.connect('/');
var truechat = angular.module('truechat',[]);

truechat.service('Socket',function(){
	this.conn = io.connect('/');
	// var socket = io.connect('/');
	// this.on = socket.on;
	// this.emit = socket.emit;
	// socket.on('connection',function(){
	// 	console.log('socket connected');
	// });
	// socket.on('globalMsg', function (data) {
	// console.log(data);
	// alert(data);
	// });
	// var notifyAll = function(){
	// 	if(socket){
	// 		var el = document.getElementById('thetext');
	// 		if( el && el.value ){
	// 			socket.emit('notifyall',el.value);
	// 		}
	// 	}
	// }
});

truechat.controller('MainCtrl',function($scope,$http){
	// $scope.$on('thetext.change',function(v){
	// 	$scope.remotetext = v.targetScope.thetext;
	// });
	$scope.messages = [];
	$scope.users = [];
	$scope.chats = [];
	$http.get('_api/users')
	  .success(function(data){
	  	$scope.users = data;
	  })
	  .error(function(data){
	  	$scope.users.push({nickname:'',email:'Sorry, no users.'});
	  });
	$http.get('_api/chats')
	  .success(function(data){
	  	$scope.chats = data;
	  })
	  .error(function(data){
	  	$scope.chats.push({title:'Sorry, no chats.'});
	  });

	$scope.pushMessage = function(){
		$scope.messages.push({date:new Date(),txt:$scope.thetext,u:$scope.nickname});
		Socket.emit('msg.pushToAll',{u:$scope.nickname,txt:$scope.thetext});
		$scope.thetext = '';
	}
	Socket.on('msg.toMe',function(data){
		$scope.remotetext = data.txt;
		$scope.$apply();
	});
	Socket.on('msg.pushToMe',function(data){
		$scope.messages.push(data);
		$scope.$apply();
	});
});


truechat.directive('msgSynch',function(){
	return {
		require:'ngModel',
		link:function($scope, $elem, $attr, ngModelController){
			$scope.$watch('thetext',function(v){
				console.log(v);
				// $scope.$emit('thetext.change',v);
				Socket.emit('msg.toAll',{u:$scope.nickname,txt:v});
			});
		}
	}
});