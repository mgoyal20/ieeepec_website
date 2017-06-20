angular.module('HandleModule').controller('HandleController', ['$scope', '$http', 'toastr', function($scope, $http, toastr){

	$scope.submitAddEventForm = function(){
		$scope.addEventForm.loading = true;
		// Submit request to Sails.
		$http.post('/addEvent', {
			name: $scope.addEventForm.name,
			description: $scope.addEventForm.description
		})
		.then(function onSuccess(sailsResponse){
			window.location = '/handleEvents';
		})
		.catch(function onError(sailsResponse){
		})
		.finally(function eitherWay(){
			$scope.addEventForm.loading = false;
		});
	}

	$scope.submitAddNewsForm = function(){
		$scope.addNewsForm.loading = true;
		// Submit request to Sails.
		$http.post('/addNews', {
			title: $scope.addNewsForm.title,
			description: $scope.addNewsForm.description
		})
		.then(function onSuccess(sailsResponse){
			window.location = '/handleNews';
		})
		.catch(function onError(sailsResponse){
		})
		.finally(function eitherWay(){
			$scope.addNewsForm.loading = false;
		});
	};


}]);
