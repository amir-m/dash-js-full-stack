'use strict';

angular.module('DashbookApp')
  .directive('private', [function () {
    return {
      // templateUrl: '//s3.amazonaws.com/dbk-assets/dash.html', 
      templateUrl: '/partials/private.html', 
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
      }
    };
  }]);
