'use strict';

angular.module('DashbookApp')
.directive('geoComp', [
	'$timeout',
	'$rootScope',
	function ($timeout, $rootScope) {
	return {
		templateUrl: '/partials/geo-comp.html',
		restrict: 'E',
		link: function postLink(scope, element, attrs) {
			scope.content.components.src_comp.resource_uri = 'http://maps.google.com/maps?q='
				+scope.content.components.geo_comp.latitude+','
				+scope.content.components.geo_comp.longitude;

			// var R = 6371000; // meters
			// var dLat = toRad($rootScope.latitude - parseFloat(scope.content.components.geo_comp.latitude));
			// var dLon = toRad($rootScope.longitude - parseFloat(scope.content.components.geo_comp.longitude));
			// var lat1 = toRad($rootScope.latitude);
			// var lat2 = toRad(parseFloat(scope.content.components.geo_comp.latitude));

			// var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
			// Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
			// var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
			// scope.content.components.geo_comp.scalar = Math.round(R * c);
			// scope.content.components.geo_comp.unit = Math.round(R * c) > 1000 ? 'KM' : 'M';
			scope.content.components.geo_comp.scalar = scope.content.components.geo_comp.scalar > 1000 ? 
				scope.content.components.geo_comp.scalar / 1000 : scope.content.components.geo_comp.scalar;

			scope.content.components.geo_comp.scalar = Math.round(scope.content.components.geo_comp.scalar * 10) / 10;

			scope.content.components.geo_comp.header = scope.content.components.geo_comp.header.substr(0, 16);
        	scope.content.components.geo_comp.text = scope.content.components.geo_comp.text.substr(0, 24);

			scope.safeApply();
			
			function toRad(num) {
				return num * (Math.PI / 180); 
			};

			scope.$on('suicide', function() {
      			$(element).parent().parent('section').remove();
    			$timeout(function(){
          			scope.$destroy();
      			});
    		});	
		}
	};
}]);

