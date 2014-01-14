'use strict';

angular.module('DashbookApp')
  .directive('news', [function () {
    return {
      // templateUrl: '//s3.amazonaws.com/dbk-assets/news.html', 
      templateUrl: '/partials/news.html', 
      restrict: 'E',
      replace: true,
      link: function postLink(scope, element, attrs) {
      }
    };
  }]);
