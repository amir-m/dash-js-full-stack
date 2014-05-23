'use strict';

angular.module('DashbookApp')
  .directive('descComp', [function () {
    return {
      templateUrl: '/partials/desc-comp.html',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
      }
    };
  }]);
