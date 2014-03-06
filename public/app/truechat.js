
angular.module('truechat',[])
.controller('AccountCtrl',function($scope,$http){
	// $scope.$on('thetext.change',function(v){
	// 	$scope.remotetext = v.targetScope.thetext;
	// });

	$scope.users = [];
	$scope.chats = [];
	$http.get('/_api/users')
		.success(function(data){
			$scope.users = data;
		})
		.error(function(data){
			$scope.users.push({nickname:'',email:'Sorry, no users.'});
		});
	$http.get('/_api/chats')
		.success(function(data){
			$scope.chats = data;
		})
		.error(function(data){
			$scope.chats.push({title:'Sorry, no chats.'});
		});
})
.controller('ChatCtrl',function($scope,$http){
	// var Socket = io.connect('/');
	$http.get('/_api/thechat/'+CID)
		.success(function(data){
			if(data){
				$scope.chat = data;
				Socket.on('connect',function(){
					Socket.emit('addToGroup',$scope.chat._id);
				});
				Socket.on('msg.toMe',function(data){
					$scope.remotetext = data.txt;
					$scope.$apply();
				});
				Socket.on('msg.pushToMe',function(data){
					$scope.messages.unshift(data);
					$scope.$apply();
				});
			} else {
				$scope.chat = {};
			}
		})
		.error(function(data){
			$scope.chat = {};
		});
	$scope.nickname = U;
	$scope.messages = [];
	$scope.pushMessage = function(){
		$scope.messages.unshift({date:new Date(),txt:$scope.thetext,u:$scope.nickname});
		Socket.emit('msg.pushToAll',{u:$scope.nickname,txt:$scope.thetext,chatid:$scope.chat._id});
		$scope.thetext = '';
	}
	
})
.directive('msgSynch',function(){
	return {
		require:'ngModel',
		link:function($scope, $elem, $attr, ngModelController){
			$scope.$watch('thetext',function(v){
				console.log(v);
				// $scope.$emit('thetext.change',v);
				Socket.emit('msg.toAll',{u:$scope.nickname,txt:v,chatid:$scope.CID});
			});
		}
	}
});