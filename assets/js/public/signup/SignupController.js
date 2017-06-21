angular.module('SignupModule').controller('SignupController', ['$scope', '$http', 'toastr', function($scope, $http, toastr){

	// set-up loading state
	$scope.signupForm = {
		loading: false
	}

	$scope.submitSignupForm = function(){
		// Set the loading state (i.e. show loading spinner)
		$scope.signupForm.loading = true;
		// Submit request to Sails.
		$http.post('/signup', {
			name: $scope.signupForm.name,
			sid: $scope.signupForm.sid,
			year: $scope.signupForm.year,
			branch: $scope.signupForm.branch,
			membership: $scope.signupForm.membership,
			email: $scope.signupForm.email,
			phone: $scope.signupForm.phone,
			password: $scope.signupForm.password
		})
		.then(function onSuccess(sailsResponse){
			window.location = '/';
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
			$scope.signupForm.loading = false;
		})
	},

	$scope.submitLoginForm = function (){
    	// Set the loading state (i.e. show loading spinner)
    	$scope.loginForm.loading = true;
    	// Submit request to Sails.
    	$http.put('/login', {
      		email: $scope.loginForm.email,
      		password: $scope.loginForm.password
    	})
    	.then(function onSuccess (){
      		// Refresh the page now that we've been logged in.
      		window.location = '/handleUsers';
    	})
    	.catch(function onError(sailsResponse) {
      		// Handle known error type(s).
      		// Invalid username / password combination.
      		if (sailsResponse.status === 404) {
        		toastr.error('Either your email is invalid or your account hasnot been approved by the admin', 'Error', {
          			closeButton: true
        		});
        		return;
      		}
      		if (sailsResponse.status === 400 ) {
        		// $scope.loginForm.topLevelErrorMessage = 'Invalid email/password combination.';
        		toastr.error('Invalid email/password combination.', 'Error', {
          			closeButton: true
        		});
        		return;
      		}
			toastr.error('An unexpected error occurred, please try again.', 'Error', {
				closeButton: true
			});
			return;
    	})
    	.finally(function eitherWay(){
      		$scope.loginForm.loading = false;
    	});
  	},

  	$scope.submitForgotForm = function(){
		// Set the loading state (i.e. show loading spinner)
		$scope.forgotForm.loading = true;
		// Submit request to Sails.
		$http.post('/forgotPassword', {
			email: $scope.forgotForm.email,
		})
		.then(function onSuccess(sailsResponse){
			toastr.success('A reset link has been sent to your email address', 'Success!!', {
				closeButton: true
			});
		})
		.catch(function onError(sailsResponse){
			// Handle known error type(s).
      		// Invalid username / password combination.
      		if (sailsResponse.status === 400 || 404) {
        		// $scope.loginForm.topLevelErrorMessage = 'Invalid email/password combination.';
        		toastr.error('Either your email is invalid or your account hasnot been approved by the admin', 'Error', {
          			closeButton: true
        		});
        		return;
      		}
				toastr.error('An unexpected error occurred, please try again.', 'Error', {
					closeButton: true
				});
				return;
		})
		.finally(function eitherWay(){
			$scope.forgotForm.loading = false;
		});
	},

	$scope.submitResetForm = function(){
		// Set the loading state (i.e. show loading spinner)
		$scope.resetForm.loading = true;
		// Submit request to Sails.
		$http.post('/reset', {
			password: $scope.resetForm.password,
		})
		.then(function onSuccess(sailsResponse){
			window.location = '/';
		})
		.catch(function onError(sailsResponse){
			toastr.error('An unexpected error occurred, please try again.', 'Error', {
				closeButton: true
			});
			return;
		})
		.finally(function eitherWay(){
			$scope.resetForm.loading = false;
		});
	};

}]);
