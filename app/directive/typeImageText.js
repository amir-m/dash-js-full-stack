'use strict';

angular.module('DashbookApp')
  .directive('typeImageText', [function () {
    return {
      template: '<div></div>',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
        element.text('this is the typeImageText directive');
      }
    };
  }]);
