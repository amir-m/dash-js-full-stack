'use strict';

angular.module('DashbookApp')
  .directive('geo', [function () {
    return {
      // templateUrl: '//s3.amazonaws.com/dbk-assets/geo.html', 
      templateUrl: '/partials/geo.html', 
      restrict: 'E',
      replace: true,
      link: function postLink(scope, element, attrs) {
       
      }
    };
  }]);
