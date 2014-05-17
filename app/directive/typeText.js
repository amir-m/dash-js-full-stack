'use strict';

angular.module('DashbookApp')
  .directive('typeText', [function () {
    return {
      // templateUrl: '//s3.amazonaws.com/dbk-assets/dash.html', 
      templateUrl: '/partials/type-text.html', 
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
      }
    };
  }]);
