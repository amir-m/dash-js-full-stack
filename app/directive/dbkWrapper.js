'use strict';

angular.module('DashbookApp')
  .directive('dbkWrapper', ['$rootScope', function ($rootScope) {
    return {
      // templateUrl: '//s3.amazonaws.com/dbk-assets/dbk-wrapper.html', 
      templateUrl: '/partials/dbk-wrapper.html', 
      restrict: 'E',
      link: function postLink(scope, element, attrs) {

      	scope.showLibrary = function() {
          if ($rootScope.sortableEnabled) return;
      		$(".dbk-wrapper").toggleClass("push-screen");
      	}
      }
    };
  }]);
