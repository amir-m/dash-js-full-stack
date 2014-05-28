'use strict';

angular.module('DashbookApp')
.directive('geoComp', [function () {
	return {
		templateUrl: '/partials/geo-comp.html',
		restrict: 'E',
		link: function postLink(scope, element, attrs) {
			scope.content.components.src_comp.resource_uri = 'http://maps.google.com/maps?q='
				+scope.content.components.geo_comp.latitude+','
				+scope.content.components.geo_comp.longitude;

			console.log(scope.content);

			// function calculateScalar(data) {
	  //         scope.d.content = data.content;
	  //         scope.skip = data.skip;

	  //         for (var i = 0; i < scope.d.content.length; ++i) {
	  //           var R = 6371000; // meters
	  //           var dLat = toRad($rootScope.latitude - parseFloat(scope.d.content[i].geo.location.latitude));
	  //           var dLon = toRad($rootScope.longitude - parseFloat(scope.d.content[i].geo.location.longitude));
	  //           var lat1 = toRad($rootScope.latitude);
	  //           var lat2 = toRad(parseFloat(scope.d.content[i].geo.location.latitude));

	  //           var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
	  //           Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
	  //           var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
	  //           scope.d.content[i].scalar = Math.round(R * c);
	  //           scope.d.content[i].unit = Math.round(R * c) > 1000 ? 'KM' : 'M';
	  //         };

	  //         scope.d.content.sort(function(a, b){
	  //           return a.scalar - b.scalar;
	  //         });

	  //         for (var i = 0; i < scope.d.content.length; ++i) {
	  //           scope.d.content[i].scalar = scope.d.content[i].scalar > 1000 ? 
	  //           scope.d.content[i].scalar / 1000 : scope.d.content[i].scalar;
	  //         };

	  //         scope.safeApply();
	  //         $('#' + scope.d.id + ' .spinner').hide();
	  //         attachFlipsnap();
	  //       };

	  //       function toRad(num) {
	  //         return num * (Math.PI / 180); 
	  //       };

		}
	};
}]);

