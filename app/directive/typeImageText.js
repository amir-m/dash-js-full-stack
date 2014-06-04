'use strict';

angular.module('DashbookApp')
  .directive('typeImageText', [function () {
    return {
// templateUrl: '//s3.amazonaws.com/dbk-assets/dash.html', 
      templateUrl: '/partials/type-image-text.html', 
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
      	if (scope.content.header) scope.content.header = scope.content.header.substr(0, 16);
      }
    };
  }]);
