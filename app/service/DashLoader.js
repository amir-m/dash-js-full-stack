'use strict';

angular.module('DashbookApp')
  .factory('Dashloader', [
  	'$http', '$q', '$rootScope', '$location',
  	function Dashloader($http, $q, $rootScope, $location) {
  		
  		return function() {
  			var uri = '/dashes/'+$rootScope.uuid;

  			var deffered = $q.defer();

	    	$http.get(uri)
	    	.success(function(data){
          
          $rootScope.user = data.user;
          $rootScope.myDashes = data.dashes;

          if ($rootScope.user.status != 3 || $rootScope.user.status != '3') {
            return $location.path('/register');
          } 

          deffered.resolve();
	    	})
	    	.error(function(error){
	    		deffered.reject(error);	
	    	})

	    	return deffered.promise;
  			
  		};

	}]);
