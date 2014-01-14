'use strict';

angular.module('DashbookApp')
  .directive('stats', [function () {
    return {
      // templateUrl: '//s3.amazonaws.com/dbk-assets/stats.html',
      templateUrl: '/partials/stats.html',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
      }
    };
  }]);
