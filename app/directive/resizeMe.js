'use strict';

angular.module('DashbookApp')
  .directive('resizeMe', [
  	'$rootScope',
  	function ($rootScope) {
    return {
      restrict: 'A',
      link: function postLink(scope, element, attrs) {
      	scope.$on('resize', function(){
	        $(element).resizecrop({
		      width: $rootScope._width,
		      height: 300,
		      vertical: "top"
		    }); 
      	});
      }
    };
  }]);
