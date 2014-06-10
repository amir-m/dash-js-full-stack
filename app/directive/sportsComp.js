'use strict';

angular.module('DashbookApp')
.directive('sportsComp', [function () {
	return {
		templateUrl: '/partials/sports-comp.html',
		restrict: 'E',
		link: function postLink(scope, element, attrs) {
			// console.log(scope.d)
		}
	};
}]);
