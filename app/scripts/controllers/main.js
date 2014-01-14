'use strict';

angular.module('DashbookApp')
  .controller('MainCtrl', [
  	'$scope', 'dashes', '$rootScope', 
  function ($scope, dashes, $rootScope) {
    
    $rootScope.myDashes = dashes;

    $rootScope.safeApply = function() {
    	if ($rootScope.$$phase != '$apply' && $rootScope.$$phase != '$digest')
      		$rootScope.$apply();
    };

    $rootScope.addDash = function(dash) {
    	if (!$rootScope.myDashes) {
    		$rootScope.myDashes = [];
    		$rootScope.myDashes.push(dash)
    		$rootScope.myDashList = [];
    		$rootScope.myDashList.push(dash._id);
    	}
    	else {
    		$rootScope.myDashes.unshift(dash);
    		$rootScope.myDashList = $rootScope.myDashList || [];
    		$rootScope.myDashList.unshift(dash._id);
    	}
    	localStorage['myDashList'] = JSON.stringify($rootScope.myDashList);
    };

    $rootScope.deleteDash = function(dash) {
    	// $rootScope.myDashes.indexOf(dash)
    	if ($rootScope.myDashes) {
    		$rootScope.myDashes.splice($rootScope.myDashes.indexOf(dash), 1);
    		$rootScope.myDashList.splice($rootScope.myDashList.indexOf(dash._id), 1);
    		localStorage['myDashList'] = JSON.stringify($rootScope.myDashList);

    		$rootScope.safeApply();
    	}
    }

    $rootScope.reArrange = function(newArrangement) {
        // $rootScope.myDashes = newArrangement;
        $rootScope.myDashList = newArrangement;
        localStorage['myDashList'] = JSON.stringify(newArrangement);
        // console.log(localStorage['myDashList'])
    };

    var intv = setInterval(function(){
        $scope.safeApply();
    }, 1000);


  }]);
