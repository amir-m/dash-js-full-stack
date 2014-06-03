'use strict';

angular.module('DashbookApp')
  .directive('typeImage', [function () {
    return {
      // templateUrl: '//s3.amazonaws.com/dbk-assets/dash.html', 
      templateUrl: '/partials/type-image.html', 
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
      }
    };
  }]);
