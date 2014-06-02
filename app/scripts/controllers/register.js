'use strict';

angular.module('DashbookApp')
.controller('RegisterCtrl', [
    '$scope', 
    '$rootScope', 
    '$http',
    'count',
    function ($scope, $rootScope, $http, count) {
        // $scope.email = 'email@domain.com';
        $scope.conflict = false;
        $scope.count = count;

        $scope.register = function() {
            $http.post('/email', {
                email: $scope.email,
                uuid: $scope.uuid
            })
            .success(function(data, status){
                console.log(data);
                $scope.count = data.count;
                if ((data.error && data.error == 409) || data.conflict) $scope.conflict = true;
                else if (data.status == 2 || data.status == '2') {
                    // $scope.user.status = 2;
                    $scope.just_registered
                }
            })
            .error(function(error){
                // TODO: Handle error
                if (error == 409) $scope.conflict = true;
            });
        };
    }
]);
