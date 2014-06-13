'use strict';

angular.module('DashbookApp')
.directive('notifications', [
  '$http', '$timeout', '$rootScope', '$compile',
  function ($http, $timeout, $rootScope, $compile) {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: '/partials/notifications.html', 
      link: function (scope, element, attrs) {
        
        $(element).find('.notification-text').append($compile(scope.notification.text)(scope));

        scope.dismissMe = function() {
          $http.post('/notification/' 
            + scope.notification.id 
            + '/dismiss/' + scope.user.uuid, {
            dismissed_at: new Date().getTime()
          });
          
          scope.user.nots.splice(0, 1);
          scope.nots.pop();
          if (scope.user.nots.length > 0) {
            scope.nots.push(scope.user.nots[0]);
            $(element).remove();
            scope.safeApply();
          }
          else {
            $('.notification').remove();
            scope.safeApply();
          }
        };
      }
    };
  }
  ]);