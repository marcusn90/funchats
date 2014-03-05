var app = angular.module('app',[]);

app.controller('UsersCtrl',function($scope,$http){
	$scope.status = '-----status-------';
	var getusers = function(){
		$http.get('/api/users')
		.success(function(data){
			$scope.users = data;
		})
		.error(function(data){
			console.log('Error',data);
		});
	}
	getusers();
	$scope.addUser = function(){
		console.log('GOOG');
		$http.post('/api/users',{first_name:$scope.first_name,last_name:$scope.last_name})
		.success(function(data){
			$scope.status = data;
			getusers();
			$scope.first_name = '';
			$scope.last_name = '';
		})
		.error(function(data){
			$scope.status = data;
		});
	}

});