'use strict';

angular.module('DashbookApp')
  .directive('private', [function () {
    return {
      template: '<div></div>',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
        element.text('this is the private directive');
      }
    };
  }]);
