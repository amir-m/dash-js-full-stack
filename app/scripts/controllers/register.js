'use strict';

angular.module('DashbookApp')
.controller('RegisterCtrl', [
    '$scope', 
    '$rootScope', 
    '$http',
    function ($scope, $rootScope, $http) {
        console.log($scope.user);
        $scope.email = 'email@domain.com';
        
        $scope.register = function() {
            $http.post('/email', {
                email: $scope.email,
                uuid: $scope.uuid
            })
            .success(function(data){
                console.log(data);
            })
            .error(function(error){
                // TODO: Handle error
                console.log(error);
            })
        };
    }
]);
