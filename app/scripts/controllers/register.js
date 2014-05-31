'use strict';

angular.module('DashbookApp')
.controller('RegisterCtrl', [
    '$scope', 
    '$rootScope', 
    '$http',
    function ($scope, $rootScope, $http) {
        console.log($scope.user);
    }
]);
