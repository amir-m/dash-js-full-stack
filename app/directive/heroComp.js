'use strict';

angular.module('DashbookApp')
  .directive('heroComp', [function () {
    return {
      templateUrl: '/partials/hero-comp.html',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
      }
    };
  }]);
