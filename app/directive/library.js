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
      }
    };
  }]);
