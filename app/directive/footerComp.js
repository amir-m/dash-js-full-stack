'use strict';

angular.module('DashbookApp')
.directive('footerComp', ['$timeout',
	function ($timeout) {
	return {
		templateUrl: '/partials/footer-comp.html',
		restrict: 'E',
		link: function postLink(scope, element, attrs) {

	      	scope.$on('suicide', function(){
	      
	      		$(element).parent().parent('section').remove();
				$timeout(function(){
	      			scope.$destroy();
      			});
			});	
		}
	};
}]);
