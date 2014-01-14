'use strict';

angular.module('DashbookApp')
  .factory('Dashloader', [
  	'$http', '$q', '$rootScope',
  	function Dashloader($http, $q, $rootScope) {
  		
  		return function() {

        // return delete localStorage['myDashList'];
  		
        // var cookie = document.cookie;

        // window.alert(cookie)

        // if (cookie) {
        //   cookie = cookie.replace(' ', '');
        //   var cookies = cookie.split(";")
        //   for (var i in cookies) {
        //     var key = cookies[i].split('=')[0];
        //     var value = cookies[i].split('=')[1];
        //     // console.log(key, value);
        //     $rootScope[key] = value;
        //     window.alert($rootScope[key]);
        //   }
        // }
        // if (!$rootScope.uuid) return;

  			var uri = '/dashes/'+$rootScope.uuid;

        if (localStorage['myDashList'] && localStorage['myDashList'].length > 0) {
          $rootScope.myDashList = JSON.parse(localStorage['myDashList']);
  				uri += '?'
  				var list = localStorage['myDashList'];
  				list = JSON.parse(list);
  				for (var i = 0; i < list.length; ++i)
  					uri += i + '=' +list[i] + '&';
  			}

        // console.log(uri);

        function start() {
          
        }

  			var deffered = $q.defer();

	    	$http.get(uri)
	    	.success(function(dashes){
          if (dashes.length == 0) {
            delete $rootScope.myDashList;
            delete localStorage['myDashList'];
            deffered.resolve(dashes);
          }
	    		else if ($rootScope.myDashList) {
            var t = [], removeMe;

            for (var i = 0; i < $rootScope.myDashList.length; ++i) {
              for (var j = 0; j < dashes.length; ++j)
                if ($rootScope.myDashList[i] == dashes[j]._id) {
                  t.push(dashes[j]);
                  removeMe = j;
                }
              dashes.splice(removeMe, 1);
            }
            deffered.resolve(t);
          }
          else deffered.resolve(dashes)
       //    $rootScope.myDashList = [];
       //    localStorage['myDashList'] = [];
       //    for (var j = 0; j < dashes.length; ++j) {
       //      $rootScope.myDashList.push(dashes[j]._id);
            
       //    }
       //    // console.log($rootScope.myDashList)
       //    localStorage['myDashList'] = JSON.stringify($rootScope.myDashList);
       //    console.log($rootScope.myDashList)
       //    console.log(localStorage['myDashList'])
	    		// deffered.resolve(dashes);
	    	})
	    	.error(function(error){
	    		deffered.reject(error);	
	    	})

	    	return deffered.promise;
  			
  		};

	}]);
