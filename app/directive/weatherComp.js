'use strict';

angular.module('DashbookApp')
  .directive('weatherComp', [function () {
    return {
      templateUrl: '/partials/weather-comp.html',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
      }
    };
  }]);
