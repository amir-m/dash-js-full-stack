'use strict';

angular.module('DashbookApp')
.directive('statsComp', [function () {
	return {
		templateUrl: '/partials/stats-comp.html',
		restrict: 'E',
		link: function postLink(scope, element, attrs) {
		}
	};
}]);
