'use strict';

angular.module('DashbookApp')
.directive('footerComp', [function () {
	return {
		templateUrl: '/partials/footer-comp.html',
		restrict: 'E',
		link: function postLink(scope, element, attrs) {
			element.text('this is the footerComp directive');
		}
	};
}]);
