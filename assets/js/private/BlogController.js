angular.module('BlogModule').controller('BlogController', ['$scope', '$http', 'toastr', function($scope, $http, toastr){
    $scope.blogForm={
        loading: false
    }
    	$scope.submitblogForm = function(){
            // Set the loading state (i.e. show loading spinner)
		$scope.signupForm.loading = true;
        console.log("SOmething is coming")
        }
        // Submit request to Sails.
		$http.post('/blog', {
			title: $scope.blogForm.title,
			description:$scope.blogForm.description,
            image:$scope.blogForm.fileToUpload
		})
		.then(function onSuccess(sailsResponse){
			window.location = '/';
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
            

}]);