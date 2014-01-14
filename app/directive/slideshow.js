'use strict';

angular.module('DashbookApp')
  .directive('slideshow', [function () {
    return {
      // templateUrl: '//s3.amazonaws.com/dbk-assets/slideshow.html', 
      templateUrl: '/partials/slideshow.html', 
      restrict: 'E',
      replace: true,
      link: function postLink(scope, element, attrs) {
      }
    };
  }]);
