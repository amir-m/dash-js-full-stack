'use strict';

angular.module('DashbookApp', [])
  .config(['$routeProvider',function ($routeProvider) {
    $routeProvider
      .when('/', {
        // templateUrl: '//s3.amazonaws.com/dbk-assets/main.html',
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        resolve: {
          dashes: [
          'Dashloader', function(Dashloader){
            return Dashloader();
          }]
        }
      })
      .when('/register', {
        // templateUrl: '//s3.amazonaws.com/dbk-assets/main.html',
        templateUrl: 'views/register.html',
        controller: 'RegisterCtrl',
        resolve: {
          count: ['$rootScope', '$location', function($rootScope, $location){
            if (!$rootScope.user || $rootScope.user.status == 3) $location.path('/');
            return CountLoader();
          }]
        }
      })
      .otherwise({
        redirectTo: '/'
      });
  }])
  .run(['$http', '$rootScope', function($http, $rootScope){

    var winWidth = $(window).width();

    $rootScope._width = 315;

    // if (winWidth > 480)
    //   $rootScope._width = 483;

        var cookie = document.cookie;

        if (cookie) {
          cookie = cookie.replace(/ /g, '');;
          var cookies = cookie.split(";")
          for (var i in cookies) {
            var key = cookies[i].split('=')[0];
            var value = cookies[i].split('=')[1];
            if (key == 'uuid') 
              $rootScope.uuid = value;
            else if (key == 'sid') 
              $rootScope.sid = value;
            else if (key == 'latitude') 
              $rootScope.latitude = parseFloat(value);
            else if (key == 'longitude') 
              $rootScope.longitude = parseFloat(value);
          }

          // if ('NUM1MEZEODMtQkFDMy00MDgzLTgzQ0ItMTU4NjUyRjIyNTdB' == $rootScope.uuid 
          //     || 'NTk3NTFBRTItNTc4Ri00QTVGLUExNUQtOTVDRUM2MzBBRjY5'  == $rootScope.uuid)
            $rootScope.showMe = true;

          if ($rootScope.$$phase != '$apply' && $rootScope.$$phase != '$digest')
            $rootScope.$apply();
        }

  }]);
