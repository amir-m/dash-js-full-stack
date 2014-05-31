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
                if (data.status == 2 || data.status == '2')
                    $scope.user.status = 2;
            })
            .error(function(error){
                // TODO: Handle error
                console.log(error);
            })
        };
    }
]);
