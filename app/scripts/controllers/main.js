'use strict';

angular.module('DashbookApp')
  .controller('MainCtrl', [
  	'$scope', 
    'dashes', 
    '$rootScope', 
    '$http',
  function ($scope, dashes, $rootScope, $http) {
    
    // $rootScope.myDashes = dashes;

    $scope.nots = [];

    $rootScope.safeApply = function() {
    	if ($rootScope.$$phase != '$apply' && $rootScope.$$phase != '$digest')
      		$rootScope.$apply();
    };

    if ($scope.user.notifications > 0) {
        $http.get('/notifications/'+$scope.user.uuid)
        .success(function(data){
            $scope.user.nots = data;
            $scope.nots.push($scope.user.nots[0]);
            $http.post('/notification/'+$scope.user.nots[0].id+'/seen', 
                { seen_at: new Date().getTime() });
        })
        .error(function(error){
            console.log(error)
        });
    };

    $scope.add = function(dash) {

        if (!dash.addRequested) {
            dash.addRequested = true;
            $(document).find(".expand").removeClass("expand");
            $('#'+dash.id+'-lib-add-btn span').addClass("expand");
            return;
        };
  
        dash.addRequested = false;
        $scope.showLibrary();
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
            // setTimeout(function(){
            //     $('article').removeClass('first-child');
            //     $('article:first-child').addClass('first-child');
            // }, 25);
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
