'use strict';

angular.module('DashbookApp')
  .directive('descComp', [
  	'$timeout',
  	function ($timeout) {
    return {
      templateUrl: '/partials/desc-comp.html',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {

        if (scope.content.components.desc_comp.header) 
          scope.content.components.desc_comp.header = scope.content.components.desc_comp.header.substr(0, 16);
        if (scope.content.components.desc_comp.text) 
          scope.content.components.desc_comp.text = scope.content.components.desc_comp.text.substr(0, 24);

      	scope.$on('suicide', function(){
      		
      		$(element).parent().parent('section').remove();
    			$timeout(function(){
          			scope.$destroy();
      			});
    		});	
      }
    };
  }]);
