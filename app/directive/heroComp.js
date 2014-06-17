'use strict';

angular.module('DashbookApp')
.directive('heroComp', [
 '$timeout',
 function ($timeout) {
  return {
    templateUrl: '/partials/hero-comp.html',
    restrict: 'E',
    link: function postLink(scope, element, attrs) {
      // console.log(scope.d.components_settings)
      // console.log(scope.d.privateDash)
      // return
      if (scope.d.components_settings 
        && scope.d.components_settings.hero_comp 
        && scope.d.components_settings.hero_comp.class) {
        for (var i = 0; scope.d.components_settings.hero_comp.class.length; ++i) {
          // console.log(scope.d.components_settings.hero_comp.class.length);
          // console.log(scope.d.components_settings.hero_comp.class[0]);
          // console.log(scope.d.components_settings.hero_comp.class[1]);
          console.log(i)
          // $(element).find('.hero-comp span').addClass(scope.d.components_settings.hero_comp.class[i]);
        }
      };
      scope.$on('suicide', function(){
        $(element).parent().parent('section').remove();
        $timeout(function(){
         scope.$destroy();
       });
      });	
    }
  };
}]);
