'use strict';

angular.module('DashbookApp')
.controller('RegisterCtrl', [
    '$scope', 
    '$rootScope', 
    '$http',
    'count',
    '$location',
    function ($scope, $rootScope, $http, count, $location) {
        // $scope.email = 'email@domain.com';
        $scope.just_registered = false;
        $scope.count = count;
        $('.spinner').hide();
        $scope.register = function() {
            $('.spinner').show();
            $http.post('/email', {
                email: $scope.email,
                uuid: $scope.uuid
            })
            .success(function(data, status){
                $('.spinner').hide();
                $scope.count = data.count;
                console.log(data);
                if ((data.error && data.error == 409) || data.conflict) $scope.conflict = true;
                else if (data.status == 2 || data.status == '2') {
                    // $scope.user.status = 2;
                    $scope.just_registered = true;
                    if ($scope.email.indexOf(':') != -1) checkIfConfirmed();
                }
                else if (data.status == 3) checkIfConfirmed();
                $scope.apply();
            })
            .error(function(error){
                // TODO: Handle error
                if (error == 409) $scope.conflict = true;
                if (error == 400) $scope.badEmail = true;
            });
        };

        
        function checkIfConfirmed() {
            $('.spinner').show();
            var intv = setTimeout(function(){
                $http.get('/me/'+$rootScope.uuid)
                .success(function(user){
                    console.log(user);
                    $rootScope.user = user;
                    if (user.status == 3 || user.status == '3') $location.path('/');
                })
                .error(function(){
                    $('.spinner').hide();
                })
            }, 5000);
        }; 
    }
]);
