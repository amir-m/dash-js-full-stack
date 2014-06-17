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

        console.log(scope.d.components_settings)
        if (scope.d.components_settings 
        && scope.d.components_settings.desc_comp 
        && scope.d.components_settings.desc_comp.trim) {
          if (scope.d.components_settings.desc_comp.trim.header) {
            var l = scope.d.components_settings.desc_comp.trim.header;
            var threeDots, temp = scope.content.components.desc_comp.header.split(' ');
            threeDots = temp.length > l ? '...' : '';
            temp = temp.splice(0, l);

            scope.content.components.desc_comp.header = temp.join(' ');
            scope.content.components.desc_comp.header += threeDots;
          }
          if (scope.d.components_settings.desc_comp.trim.text) {
            var l = scope.d.components_settings.desc_comp.trim.text;
            var threeDots, temp = scope.content.components.desc_comp.text.split(' ');
            threeDots = temp.length > l ? '...' : '';
            temp = temp.splice(0, l);

            scope.content.components.desc_comp.text = temp.join(' ');
            scope.content.components.desc_comp.text += threeDots;
          }
        };

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
