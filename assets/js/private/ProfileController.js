angular.module('ProfileModule').controller('ProfileController', ['$scope', '$http', 'toastr', function($scope, $http, toastr){
    
    $scope.editForm = {
        loading: false
    }

    $scope.submitEditForm = function(){
		// Set the loading state (i.e. show loading spinner)
		$scope.editForm.loading = true;

		// Submit request to Sails.
		$http.post('/editProfile', {
			name: $scope.editForm.name,
			sid: $scope.editForm.sid,
			year: $scope.editForm.year,
			branch: $scope.editForm.branch,
			membership: $scope.editForm.membership,
			email: $scope.editForm.email,
			phone: $scope.editForm.phone
		})
		.then(function onSuccess(sailsResponse){
			window.location = '/profile';
		})
		.catch(function onError(sailsResponse){

		// Handle known error type(s).
		// If using sails-disk adpater -- Handle Duplicate Key
		var emailAddressAlreadyInUse = sailsResponse.status == 409;

		if (emailAddressAlreadyInUse) {
			toastr.error('That email address has already been taken, please try again.', 'Error');
			return;
		}

		})
		.finally(function eitherWay(){
			$scope.editForm.loading = false;
		})
	},

    $scope.submitBlogForm = function(){
        // Set the loading state (i.e. show loading spinner)
		$scope.BlogForm.loading = true;
        console.log("Something is coming")
        // Submit request to Sails.
		$http.post('/blog', {
			title: $scope.blogForm.title,
			description:$scope.blogForm.description
		})
		.then(function onSuccess(sailsResponse){
			window.location = '/profile';
		})
		.catch(function onError(sailsResponse){

		// Handle known error type(s).
		// If using sails-disk adpater -- Handle Duplicate Key
		var emailAddressAlreadyInUse = sailsResponse.status == 409;

		if (emailAddressAlreadyInUse) {
			toastr.error('LOLOL', 'Error');
			return;
		}

		})
		.finally(function eitherWay(){
			$scope.blogForm.loading = false;
		})
    }       

}]);