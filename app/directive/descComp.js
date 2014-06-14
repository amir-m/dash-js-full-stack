'use strict';

angular.module('DashbookApp')
  .directive('descComp', [
  	'$timeout',
  	function ($timeout) {
    return {
      templateUrl: '/partials/desc-comp.html',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {

        scope.content.components.desc_comp.text = scope.content.components.desc_comp.text.replace(/<\w*>/g, '');
        scope.content.components.desc_comp.text = scope.content.components.desc_comp.text.replace(/<\/\w*>/g, '');
        scope.content.components.desc_comp.text = scope.content.components.desc_comp.text.replace(/&nbsp;/g, '');

        if (scope.d.title == 'World Cup News') {
          // scope.content.components.desc_comp.header = scope.content.components.desc_comp.header.substr(0, 36);
          // scope.content.components.desc_comp.text = scope.content.components.desc_comp.text.substr(0, 84);
          var a, t = scope.content.components.desc_comp.text.split(' ');
          a = t.length > 21 ? '...' : '';
          t = t.splice(0, 21);

          scope.content.components.desc_comp.text = t.join(' ');
          scope.content.components.desc_comp.text += a;
        }
        else {
          if (scope.content.components.desc_comp.header) 
            scope.content.components.desc_comp.header = scope.content.components.desc_comp.header.substr(0, 16);
          if (scope.content.components.desc_comp.text) 
            scope.content.components.desc_comp.text = scope.content.components.desc_comp.text.substr(0, 24);
        }


        
        

      	scope.$on('suicide', function(){
      		
      		$(element).parent().parent('section').remove();
    			$timeout(function(){
          			scope.$destroy();
      			});
    		});	
      }
    };
  }]);
