'use strict';

angular.module('DashbookApp')
  .factory('CountLoader', [
  	'$http', '$q', '$rootScope', '$location',
  	function CountLoader($http, $q, $rootScope, $location) {
  		
  		return function() { 
        var d = $q.defer()

        $http.get('/email/count?uuid='+$rootScope.uuid)
        .success(function(data, status){
            console.log(data);
            d.resolve(data.count);
            
        })
        .error(function(error){
            // TODO: Handle error
            if (error == 409) $rootScope.conflict = true;
        });
        
        return d.promise;

  		};

	}]);
