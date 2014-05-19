'use strict';

angular.module('DashbookApp', [])
  .config(['$routeProvider',function ($routeProvider) {
    $routeProvider
      .when('/', {
        // templateUrl: '//s3.amazonaws.com/dbk-assets/main.html',
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        resolve: {
          dashes: ['Dashloader', function(Dashloader){
            return Dashloader();
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

    if (winWidth > 480)
      $rootScope._width = 483;

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

          $rootScope.showMe = $rootScope.uuid == 'NTk3NTFBRTItNTc4Ri00QTVGLUExNUQtOTVDRUM2MzBBRjY5' ? true : false;

          if ($rootScope.$$phase != '$apply' && $rootScope.$$phase != '$digest')
            $rootScope.$apply();
        }

  }]);
