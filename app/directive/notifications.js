'use strict';

angular.module('DashbookApp')
.directive('notifications', [
  '$http', '$timeout', '$rootScope', '$compile',
  function ($http, $timeout, $rootScope, $compile) {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: '/partials/notifications.html', 
      link: function (scope, element, attrs) {
        $(element)
      }
    };
  }
  ]);