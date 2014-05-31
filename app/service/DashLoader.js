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

          if (data.user != 3 || data.user != '3') 
            return $location.path('/register');

          $rootScope.user = data.user;
          $rootScope.myDashes = data.dashes;
          deffered.resolve();
	    	})
	    	.error(function(error){
	    		deffered.reject(error);	
	    	})

	    	return deffered.promise;
  			
  		};

	}]);
