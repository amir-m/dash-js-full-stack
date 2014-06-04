'use strict';

angular.module('DashbookApp')
  .directive('typeText', [function () {
    return {
      // templateUrl: '//s3.amazonaws.com/dbk-assets/dash.html', 
      templateUrl: '/partials/type-text.html', 
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
      	if (scope.content.header) scope.content.header = scope.content.header.substr(0, 16);
      	if (scope.content.text) scope.content.text = scope.content.text.substr(0, 24);
      }
    };
  }]);
