'use strict';

angular.module('DashbookApp')
  .directive('chartsComp', [function () {
    return {
      templateUrl: '/partials/charts-comp.html',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
      }
    };
  }]);
