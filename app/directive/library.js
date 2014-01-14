'use strict';

angular.module('DashbookApp')
  .directive('library', [ '$http', '$rootScope',
  	function ($http, $rootScope) {
    return {
      // templateUrl: '//s3.amazonaws.com/dbk-assets/library.html', 
      templateUrl: '/partials/library.html', 
      restrict: 'E',
      link: function postLink(scope, element, attrs) {

        $http.get('/dashes')
        .success(function(dashes){
        	scope.dashes = dashes;
        })
        .error(function(error){
        	console.log(error)
        });

        scope.add = function(dash) {

          if (!dash.addRequested) {
            dash.addRequested = true;
            $(document).find(".expand").removeClass("expand");
            $('#'+dash._id+'-lib-add-btn').addClass("expand");
            return;
          };
          dash.addRequested = false;
          $(document).find(".expand").removeClass("expand");
        	$http.put('/dashes/'+dash._id+'/'+$rootScope.uuid)
        	.success(function(data, status){
            scope.addDash(data);
            scope.safeApply();
            scope.showLibrary();
        	})
        	.error(function(error){
        		console.log(error);
        	});
        };

      }
    };
  }]);
