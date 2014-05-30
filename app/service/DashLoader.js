'use strict';

angular.module('DashbookApp')
  .factory('Dashloader', [
  	'$http', '$q', '$rootScope',
  	function Dashloader($http, $q, $rootScope) {
  		
  		return function() {
  			var uri = '/dashes/'+$rootScope.uuid;

  			var deffered = $q.defer();

	    	$http.get(uri)
	    	.success(function(data){

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
