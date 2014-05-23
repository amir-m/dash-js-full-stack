'use strict';

angular.module('DashbookApp')
.directive('geoComp', [function () {
	return {
		templateUrl: '/partials/geo-comp.html',
		restrict: 'E',
		link: function postLink(scope, element, attrs) {
		}
	};
}]);

