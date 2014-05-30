'use strict';

angular.module('DashbookApp')
  .controller('MainCtrl', [
  	'$scope', 'dashes', '$rootScope', '$http',
  function ($scope, dashes, $rootScope, $http) {
    
    // $rootScope.myDashes = dashes;

    $rootScope.safeApply = function() {
    	if ($rootScope.$$phase != '$apply' && $rootScope.$$phase != '$digest')
      		$rootScope.$apply();
    };

    $scope.add = function(dash) {

        if (!dash.addRequested) {
            dash.addRequested = true;
            $(document).find(".expand").removeClass("expand");
            $('#'+dash.id+'-lib-add-btn span').addClass("expand");
            return;
        };
  
        dash.addRequested = false;
        
        $(document).find(".expand").removeClass("expand");

        $http.put('/dashes/'+dash.id+'/'+$rootScope.user.uuid)
        .success(function(dash, status){

            if (!$rootScope.myDashes) {
                $rootScope.myDashes = [];
                $rootScope.myDashes.push(dash);
            }
            else {
                $rootScope.myDashes.unshift(dash);
            }
            $rootScope.user.dashes.unshift(dash.id);
            $scope.showLibrary();
            $scope.safeApply();
        })
        .error(function(error){
            console.log(error);
        });
    };

    $scope.reArrange = function(newArrangement) {
        $rootScope.user.dashes = newArrangement;
        $http.post('/dash/rearrange', { uuid: $scope.uuid, dashes: newArrangement });
    };

    var intv = setInterval(function(){
        $scope.safeApply();
    }, 1000);


  }]);
