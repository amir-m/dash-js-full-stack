'use strict';

angular.module('DashbookApp')
.directive('compContainer', [
	'$http',
	'$compile',
	function ($http, $compile) {
		return {
			// templateUrl: '/partials/comp-container.html',
			restrict: 'E',
			link: function postLink(scope, element, attrs) {
				console.log(scope.d);
				if (scope.d.image_uri)
					scope.d.main_image = scope.d.image_uri;
				// fetch content
				// $(element).child('.comp-wrapper') compile here based on the result.
			}
		};
	}
]);
