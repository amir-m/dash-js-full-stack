'use strict';

angular.module('DashbookApp')
.controller('RegisterCtrl', [
    '$scope', 
    '$rootScope', 
    '$http',
    'count',
    function ($scope, $rootScope, $http, count) {
        // $scope.email = 'email@domain.com';
        $scope.just_registered = false;
        $scope.count = count;

        $scope.register = function() {
            $http.post('/email', {
                email: $scope.email,
                uuid: $scope.uuid
            })
            .success(function(data, status){
                $scope.count = data.count;
                if ((data.error && data.error == 409) || data.conflict) $scope.conflict = true;
                else if (data.status == 2 || data.status == '2') {
                    // $scope.user.status = 2;
                    $scope.just_registered = true;
                    if ($scope.email.indexOf(':') != -1) checkIfConfirmed();
                }
                $scope.apply();
            })
            .error(function(error){
                // TODO: Handle error
                if (error == 409) $scope.conflict = true;
            });
        };

        
        function checkIfConfirmed() {
            var intv = setTimeout(function(){
                $http.get('/me')
                .success(function(user){
                    $rootScope.user = user;
                    if (user.status == 3 || user.status == '3') $location.path('/');
                })
            }, 7000);
        }; 
    }
]);
