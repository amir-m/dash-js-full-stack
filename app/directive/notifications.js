'use strict';

angular.module('DashbookApp')
  .directive('notifications', [
  '$http', '$timeout', '$rootScope', '$compile',
  function ($http, $timeout, $rootScope, $compile) {
    return {
      restrict: 'E',
      replace: true,
      // templateUrl: '//s3.amazonaws.com/dbk-assets/dash.html', 
      templateUrl: '/partials/notifications.html', 
      link: function (scope, element, attrs) {
      }
    };
  }]);