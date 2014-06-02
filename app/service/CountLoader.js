'use strict';

angular.module('DashbookApp')
  .factory('CoundLoader', [
  	'$http', '$q', '$rootScope', '$location',
  	function CoundLoader($http, $q, $rootScope, $location) {
  		
  		return function() { 
        var d = $q.deffer();

        $http.get('/email/count?uuid='+$rootScope.uuid)
        .success(function(data, status){
            console.log(data);
            $scope.count = data.count;
            
        })
        .error(function(error){
            // TODO: Handle error
            if (error == 409) $scope.conflict = true;
        });
        
        return d.promise;

  		};

	}]);
