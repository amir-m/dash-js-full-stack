// 'use strict';

angular.module('DashbookApp')
  .directive('dash', [
  '$http', '$timeout', '$rootScope', '$compile',
  function ($http, $timeout, $rootScope, $compile) {
    return {
      restrict: 'E',
      replace: true,
      // templateUrl: '//s3.amazonaws.com/dbk-assets/dash.html', 
      templateUrl: '/partials/dash.html', 
      link: function (scope, element, attrs) {

        scope.d.content = [], scope.flipTo = 1;

        function apiCallEngine() {
          
          if (scope.d.source_uri_keys && scope.d.source_uri_keys.length > 0) {
            if (scope.d.source_uri_keys.indexOf('{latitude}') != -1) {
              scope.d.selected_source_uri = scope.d.selected_source_uri.replace('{latitude}', scope.latitude);
              // scope.d.source_uri_keys.splice(scope.d.source_uri_keys.indexOf('{latitude}'), 1);
              // scope.d.source_uri_values.splice(0, 1);
            }
            if (scope.d.source_uri_keys.indexOf('{longitude}') != -1) {
              scope.d.selected_source_uri = scope.d.selected_source_uri.replace('{longitude}', scope.longitude);
              // scope.d.source_uri_keys.splice(scope.d.source_uri_keys.indexOf('{longitude}'), 1);
              // scope.d.source_uri_values.splice(0, 1);
            }
            for (var i = 0; i < scope.d.source_uri_keys.length; ++i) {
              if (scope.d.source_uri_keys[i] != '{latitude}' && scope.d.source_uri_keys[i] != '{longitude}')
                scope.d.selected_source_uri = scope.d.selected_source_uri.replace(scope.d.source_uri_keys[i], scope.d.source_uri_values[i]);
            }
          };

          // scope.d.selected_source_uri += '&callback=temp';

          // ajax(scope.d.selected_source_uri, function(){

          // });

          $.ajax({
            "url": scope.engine_uri + scope.d.selected_source_uri,
            "dataType": "json",
            // "xhrFields": {
            //   withCredentials: true
            // },
            "crossDomain": true,
            "success": function(apiResponseJson, status, headers){

              $('#' + scope.d.id + ' .spinner').hide();

              var content = [], tmp_con = [];

              apiResponseJson = apiResponseJson;

              if (scope.d.title == 'World Cup Brazil') {
                var todays = [];
                var today = new Date(new Date().toLocaleDateString()).getTime(), last_today_index, first_today_index = -1, first_last_diff;
                for (var i = 0; i < apiResponseJson[scope.d.data_container].length; ++i) {

                  apiResponseJson[scope.d.data_container][i].timestamp = new Date(apiResponseJson[scope.d.data_container][i].date).getTime();

                  if (apiResponseJson.data[i].timestamp == today) {
                    if (first_today_index == -1) first_today_index = i;
                    last_today_index = i;
                    todays.push(apiResponseJson.data[i]);
                  }
                }
                first_last_diff = last_today_index - first_today_index;

                if (first_today_index > 3) {
                  apiResponseJson[scope.d.data_container] = apiResponseJson[scope.d.data_container].splice(first_today_index - 4, apiResponseJson[scope.d.data_container].length);
                  first_today_index = 4;
                  last_today_index = first_today_index + first_last_diff;
                }

                if ((apiResponseJson[scope.d.data_container].length - last_today_index) > 4) {
                  apiResponseJson[scope.d.data_container] = apiResponseJson[scope.d.data_container].splice(0, last_today_index + 5);
                }

                // TODO: Remove this when games start...  
                if (apiResponseJson[scope.d.data_container].length > 12) 
                  apiResponseJson[scope.d.data_container] = apiResponseJson[scope.d.data_container].splice(0, 10);

                var index = null;
                for (var i = 0; i < todays.length; ++i) {
                  if (todays[i].status 
                    && todays[i].status.length > 0 
                    && todays[i].status.toLowerCase() != 'full-time')
                    index = todays[i].id;
                }

                if (index) {
                  for (var i = 0; i < apiResponseJson[scope.d.data_container].length; i++) {
                    if(apiResponseJson[scope.d.data_container][i].id == index) {
                      scope.flipTo = i + 1;
                    }
                  };
                }
                else {
                  scope.flipTo = first_today_index > 0 ? first_today_index + 1 : 1;
                }
                

              }
              else {

                if (apiResponseJson[scope.d.data_container].length > 10) 
                  apiResponseJson[scope.d.data_container] = apiResponseJson[scope.d.data_container].splice(0, 10);
              }

              for (var i = 0; i < apiResponseJson[scope.d.data_container].length; ++i) {

                if (scope.d.title == 'World Cup Brazil') {
                  scope.d.selected_setting = '2014';
                  if (apiResponseJson[scope.d.data_container][i].status && apiResponseJson[scope.d.data_container][i].status.length > 0)
                    apiResponseJson[scope.d.data_container][i].date = apiResponseJson[scope.d.data_container][i].status;
                  else if (todays.indexOf(apiResponseJson[scope.d.data_container][i]) != -1) {
                    apiResponseJson[scope.d.data_container][i].date = 'Today';
                  }
                  else if (apiResponseJson[scope.d.data_container][i].utc_date_time) {
                    apiResponseJson[scope.d.data_container][i].score = new Date(apiResponseJson[scope.d.data_container][i].utc_date_time).getHours()+":00";
                  }
                  if (todays.indexOf(apiResponseJson[scope.d.data_container][i]) != -1 && apiResponseJson[scope.d.data_container][i].utc_date_time && apiResponseJson[scope.d.data_container][i].score.indexOf("-") == -1) {
                    apiResponseJson[scope.d.data_container][i].score = new Date(apiResponseJson[scope.d.data_container][i].utc_date_time).getHours()+":00";
                  } 
                }
                else if (scope.d.title == 'World Cup News') {
                  scope.d.selected_setting = 'Latest News';
                }
                
                apiResponseJson[scope.d.data_container][i].components = {};

                var begin = '<section><div>',
                  end = '</div></section>';                

                for (var j = 0; j < scope.d.content_type.length; ++j) {
                  apiResponseJson[scope.d.data_container][i].components[scope.d.content_type[j]] = {};
                }

                
                for (var j = 0; j < scope.d.mapper_key.length; ++j) {
                  var value = scope.d.mapper_value[j];
                  if (scope.d.mapper_value[j].indexOf('.') != -1) {
                    value = '';
                    var values = scope.d.mapper_value[j].split('.');
                    for (var k = 0; k < values.length; ++k) {
                      value += values[k];
                      if (k != values.length -1) value += '.';
                    }
                  }

                  eval("apiResponseJson[scope.d.data_container][i].components."+scope.d.mapper_key[j]+
                    " = apiResponseJson[scope.d.data_container][i]." + value);
                }

                if (scope.d.mapper_static_key) {
                    for (var j = 0; j < scope.d.mapper_static_key.length; ++j) {
                      
                      var value = scope.d.mapper_static_value[j];

                      // console.log(scope.d.mapper_static_value);
  
                      eval("apiResponseJson[scope.d.data_container][i].components."+scope.d.mapper_static_key[j]+
                        " = '"+value+"'");
                    }
                }

                for (var j = 0; j < scope.d.content_type.length; ++j) {
                  var component = '<' + scope.d.content_type[j] +'>' + '</' + scope.d.content_type[j] +'>';
                  begin += component;
                }
                
                // TODO: Make it generic: 
                if (scope.d.title == "Food Near Me" 
                  || scope.d.title == "Coffee Near Me" 
                  || scope.d.title == "Places Near Me") {
                  begin += end;
                  var _scope = scope.$new();
                  
                  _scope.content = apiResponseJson[scope.d.data_container][i];
                  
                  tmp_con.push({
                    _scope: _scope,
                    html: begin,
                    id: _scope.$id
                  });

                  // $('#'+scope.d.id + ' .flipsnap').append($compile(begin)(_scope));
                  // scope.d.content.push(_scope.$id);
                }

                else {

                  begin += end;
                  var _scope = scope.$new();
                  _scope.content = apiResponseJson[scope.d.data_container][i];
                  
                  scope.d.content.push(_scope.$id);

                  $('#'+scope.d.id + ' .flipsnap').append($compile(begin)(_scope));
                }

              };

              // TODO: Make it generic: 
              if (tmp_con.length > 0) {
                for (var i = 0; i < tmp_con.length; ++i) {

                  var R = 6371000; // meters
                  var dLat = toRad($rootScope.latitude - parseFloat(tmp_con[i]._scope.content.components.geo_comp.latitude));
                  var dLon = toRad($rootScope.longitude - parseFloat(tmp_con[i]._scope.content.components.geo_comp.longitude));
                  var lat1 = toRad($rootScope.latitude);
                  var lat2 = toRad(parseFloat(tmp_con[i]._scope.content.components.geo_comp.latitude));

                  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
                  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
                  tmp_con[i]._scope.content.components.geo_comp.scalar = Math.round(R * c);
                  tmp_con[i]._scope.content.components.geo_comp.unit = Math.round(R * c) > 1000 ? 'KM' : 'M';

                }

                tmp_con.sort(function(a, b){
                  return a._scope.content.components.geo_comp.scalar -b._scope.content.components.geo_comp.scalar;
                });

                for (var i = 0; i < tmp_con.length; ++i) {
                  $('#'+scope.d.id + ' .flipsnap').append($compile(tmp_con[i].html)(tmp_con[i]._scope));
                  scope.d.content.push(tmp_con[i].id);
                }
              }

              scope.attachFlipsnap();
              scope.safeApply();
              // scope.$broadcast('resize');
              // scope.d.content.splice(0, 10);

            }, 
            "error": function(error) {
              console.log(arguments);
              apiCallEngine();
            }
          });
        };

        if (scope.d.title != 'Private Dash') apiCallEngine();
        
        $('#sortable').prop( "disabled", true );

        $(element).mousedown(function(e) {
          clearTimeout(this.downTimer);
          this.downTimer = setTimeout(function() {
            $('#sortable').prop( "disabled", false );
            // console.log(scope.d.id);
          }, 2000);
        }).mouseup(function(e) {
          $('#sortable').prop( "disabled", true );
          clearTimeout(this.downTimer);
        });

        scope.d.removeRequested = false;
        var flipsnap;
        var pointer;

        scope.unit = 'M';
        scope.skip = 0;

        var flipped = false, totalFetches = 0;

        if (scope.d.type == 'geo') {
          $('.cell').each(function(e){
            e.addClass('middle');
          });

          $('.table').addClass('centered');
          $('.table').addClass('location');
        }

        var flipped = false;

        function tog(v){return v ? 'addClass':'removeClass';} 

        $(document).on('input', '.clearable', function(){
          $(this)[tog(this.value)]('x');
        }).on('mousemove', '.x', function( e ){
          $(this)[tog(this.offsetWidth-25 < e.clientX-this.getBoundingClientRect().left)]('onX');   
        }).on('click', '.onX', function(){
          $(this).removeClass('x onX').val('');
        });

        scope.updateInputText = function() {
            if ($('#' + scope.d.id + '-input-text').val()) {
              $('#' + scope.d.id + ' .spinner').show();
              var selected_setting = $('#' + scope.d.id + '-input-text').val();

              scope.d.selected_setting = selected_setting.toLowerCase();
              scope.d.selected_source_uri = scope.d.source_uri_scheme;

              var index = scope.d.source_uri_keys.indexOf(scope.d.selected_setting_uri_field);
              scope.d.source_uri_values[index] = scope.d.selected_setting;

              scope.d.content = [];
              scope.$broadcast('suicide');
              apiCallEngine();
              scope.flipSettings();

              $http.post('/dashes/'+scope.d.id+'/settings', {
                setting_type: scope.d.setting_type,
                selected_setting: scope.d.selected_setting,
                source_uri_values: scope.d.source_uri_values,
                uuid: scope.uuid,
                skip: 0,
                latitude: $rootScope.latitude,
                longitude: $rootScope.longitude,
                timestamp: new Date().getTime()
              }).success(function(data){
                
              })
              .error(function(error){
                console.log(error);
              });
            }
            else return;
        };

        scope.updatePrivateDashSetting = function() {
          if ($('#' + scope.d.id + '-input-text').val()) {
            $('#' + scope.d.id + ' .spinner').show();
            scope.d.selected_setting = $('#' + scope.d.id + '-input-text').val();
            // scope.d.selected_setting = scope.d.selected_setting.toLowerCase();
            var __id = null;
            var collection_name = scope.d.content ? scope.d.content.collection_name : scope.d.title
            if (scope.d.content && scope.d.content.id)
              __id = scope.d.content.id;
            $http.post('/dashes/'+scope.d.id+'/settings', {
              textInput: scope.d.selected_setting,
              uuid: scope.uuid,
              setting_type: 'textInput',
              title: scope.d.title,
              skip: 0,
              sid: $rootScope.sid,
              latitude: $rootScope.latitude,
              longitude: $rootScope.longitude,
              content_id: __id,
              collection_name: collection_name,
              timestamp: new Date().getTime()
            })
            .success(function(data){
              scope.flipSettings();
              scope.d.notFound = null;
              scope.d.content = []
              $('#'+scope.d.id + ' .flipsnap').empty();
              scope.d.privateDash = data.privateDash;
              apiCall(data);
              // $('#' + scope.d.id + ' .spinner').hide();
              // attachFlipsnap();
              // scope.safeApply();
            })
            .error(function(error, code){
              $('#' + scope.d.id + ' .spinner').hide();
              if (code == 404) {
                scope.d.notFound = true;
              }

            });
          }
          else return;
        };

        scope.selectSetting = function(index) {
          scope.d.content = [];
          scope.$broadcast('suicide');
          scope.d.selected_source_uri = scope.d.source_uri[index];
          apiCallEngine();
          scope.flipSettings();
          $('#' + scope.d.id + ' .spinner').show();
          var selectedTime = new Date().getTime();
          scope.d.selected_setting = scope.d.settings[index];

          $http.post('/dashes/'+scope.d.id+'/settings', {
            selected_setting: scope.d.selected_setting,
            selected_source_uri: scope.d.selected_source_uri,
            uuid: scope.uuid,
            setting_type: 'radio',
            sid: $rootScope.sid,
            latitude: $rootScope.latitude,
            longitude: $rootScope.longitude,
            timestamp: new Date().getTime()
          }).success(function(data){

          })
          .error(function(error){
          });
        };

        scope.flipSettings = function() {
          if ($rootScope.sortableEnabled) return;
          if (flipped) {
            $('#' + scope.d.id ).removeClass('flip');
            scope.d.removeRequested = false;
            $('#' + scope.d.id + '-remove-btn').removeClass('expand');
          }
          else {
            $('#' + scope.d.id ).addClass('flip');
          }

          flipped = !flipped;
        };

        scope.removeDash = function() {

          if (!scope.d.removeRequested) {
            scope.d.removeRequested = true;
            $(document).find(".expand").removeClass("expand");
            $('#'+scope.d.id+'-remove-btn span').addClass("expand");
            return;
          };
          scope.d.removeRequested = true;
          $(document).find(".expand").removeClass("expand");
          $('#' + scope.d.id + '-remove-btn').addClass('expand');

          $http.delete('/dashes/'+scope.d.id+'/'+scope.user.uuid).success(function(){

            $('#' + scope.d.id ).hide();
            $('#' + scope.d.id ).remove();
            
            if (scope.myDashes) {
              scope.myDashes.splice(scope.myDashes.indexOf(scope.d), 1);
              scope.user.dashes.splice(scope.user.dashes.indexOf(scope.d.id), 1);
              scope.safeApply();
            }
            
            // setTimeout(function(){
                // $('article').removeClass('first-child');
                // $('article:first-child').addClass('first-child');
            // }, 25);

            scope.safeApply();
          
          })
          .error(function(error){
            // console.log(error);
          });
        };

        scope.uriOpened = function(content) {
          $http.post('/readcontent', {
            uuid: $rootScope.uuid,
            latitude: $rootScope.latitude,
            longitude: $rootScope.longitude,
            content_id: content.id,
            col_name: content.collection_name,
            timestamp: new Date().getTime()
          });
        }

        scope.attachFlipsnap = function() {

          flipsnap = Flipsnap('#'+scope.d.id+ ' .flipsnap');
          // flipsnap.moveToPoint(scope.flipTo);
          flipsnap.moveToPoint(scope.flipTo - 1);
          setTimeout(function(){
            // $('article').find('.current').removeClass('current');
            flipsnap.refresh();
            // pointer = $('.slide-indicator span'); 
            pointer = $('#pointer-'+scope.d.id+' span'); 
            if (!scope.d.content || scope.d.content.length == 0) return;
            //$('.slide-indicator').find('span:nth-child('+scope.flipTo.toString()+')').addClass('current');
            pointer.eq(flipsnap.currentPoint).addClass('current');
            flipsnap.element.addEventListener('fspointmove', function() {
              pointer.filter('.current').removeClass('current');
              pointer.eq(flipsnap.currentPoint).addClass('current');
            }, false);
          }, 1000);
        };

        function scheduleContentFecth(interval) {
          setTimeout(function(){
            $http.get('/content?t='+scope.d.title+'&s='+scope.d.selected_setting+'&skip='+scope.skip)
            .success(function(data){
              ++totalFetches;
              if (data.content.length == 0) {
                if (totalFetches == 4) {
                  showEmptyContent();
                  totalFetches = 0;
                }
                else {
                  scheduleContentFecth(3000);
                }

              }
              else {
                totalFetches = 0;
                scope.d.content = null;

                if (scope.d.dashType == 'geo') return calculateScalar(data);

                scope.d.content = data.content;
                scope.skip = data.skip;
                scope.safeApply();
                $('#' + scope.d.id + ' .spinner').hide();
                // scheduleContentFecthAndAppend(5000);
                scope.attachFlipsnap();
              }

            })
          }, interval);
        };

        function showEmptyContent() {
          // console.log('empty');
          $('#' + scope.d.id + ' .spinner').hide();
        };

        function scheduleContentFecthAndAppend(interval) {

          setTimeout(function(){
            $http.get('/content?t='+scope.d.title+'&s='+scope.d.selected_setting+'&skip='+scope.skip)
            .success(function(data) {
              
              scope.skip = data.skip;
              for (var i = 0; i < data.content.length; ++i) {
                  scope.d.content.push(data.content[i]);
              }
              scope.safeApply();
            });
          }, interval);
        };

        function getTitleHandler() {

          // console.log(scope.d.dashType)

          if (scope.d.dashType == 'geo' && !scope.d.selected_setting)
            return 'Current Location';
          else
            return scope.d.selected_setting;
        };

        function calculateScalar(data) {
          scope.d.content = data.content;
          scope.skip = data.skip;

          for (var i = 0; i < scope.d.content.length; ++i) {
            var R = 6371000; // meters
            var dLat = toRad($rootScope.latitude - parseFloat(scope.d.content[i].geo.location.latitude));
            var dLon = toRad($rootScope.longitude - parseFloat(scope.d.content[i].geo.location.longitude));
            var lat1 = toRad($rootScope.latitude);
            var lat2 = toRad(parseFloat(scope.d.content[i].geo.location.latitude));

            var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
            scope.d.content[i].scalar = Math.round(R * c);
            scope.d.content[i].unit = Math.round(R * c) > 1000 ? 'KM' : 'M';
          };

          scope.d.content.sort(function(a, b){
            return a.scalar - b.scalar;
          });

          for (var i = 0; i < scope.d.content.length; ++i) {
            scope.d.content[i].scalar = scope.d.content[i].scalar > 1000 ? 
            scope.d.content[i].scalar / 1000 : scope.d.content[i].scalar;
          };

          scope.safeApply();
          $('#' + scope.d.id + ' .spinner').hide();
          scope.attachFlipsnap();
        };

        function toRad(num) {
          return num * (Math.PI / 180); 
        };

        function apiCall() {
          $http.get(scope.engine_uri + scope.d.privateDash.source_uri)
          .success(function(apiResponseJson, status, headers){

            if (apiResponseJson[scope.d.privateDash.data_container].length > 10) 
                  apiResponseJson[scope.d.privateDash.data_container] = apiResponseJson[scope.d.privateDash.data_container].splice(0, 10);

              $('#' + scope.d.id + ' .spinner').hide();

              var content = [];
              
              for (var i = 0; i < apiResponseJson[scope.d.privateDash.data_container].length; ++i) {
                                
                apiResponseJson[scope.d.privateDash.data_container][i].components = {};

                var begin = '<section><div>',
                  end = '</div></section>';                

                for (var j = 0; j < scope.d.privateDash.content_type.length; ++j) {
                  apiResponseJson[scope.d.privateDash.data_container][i].components[scope.d.privateDash.content_type[j]] = {};
                }

                
                for (var j = 0; j < scope.d.privateDash.mapper_key.length; ++j) {
                  var value = scope.d.privateDash.mapper_value[j];
                  if (scope.d.privateDash.mapper_value[j].indexOf('.') != -1) {
                    value = '';
                    var values = scope.d.privateDash.mapper_value[j].split('.');
                    for (var k = 0; k < values.length; ++k) {
                      value += values[k];
                      if (k != values.length -1) value += '.';
                    }
                  }

                  eval("apiResponseJson[scope.d.privateDash.data_container][i].components."+scope.d.privateDash.mapper_key[j]+
                    " = apiResponseJson[scope.d.privateDash.data_container][i]." + value);
                }

                if (scope.d.privateDash.mapper_static_key) {
                    for (var j = 0; j < scope.d.privateDash.mapper_static_key.length; ++j) {
                      
                      var value = scope.d.privateDash.mapper_static_value[j];

                      // console.log(scope.d.privateDash.mapper_static_value);
  
                      eval("apiResponseJson[scope.d.privateDash.data_container][i].components."+scope.d.privateDash.mapper_static_key[j]+
                        " = '"+value+"'");
                    }
                }

                for (var j = 0; j < scope.d.privateDash.content_type.length; ++j) {
                  var component = '<' + scope.d.privateDash.content_type[j] +'>' + '</' + scope.d.privateDash.content_type[j] +'>';
                  begin += component;
                }
                
                // TODO: Make it generic: 
                if (scope.d.privateDash.title == "Food Near Me" 
                  || scope.d.privateDash.title == "Coffee Near Me" 
                  || scope.d.privateDash.title == "Places Near Me") {
                  begin += end;
                  var _scope = scope.$new();
                  
                  _scope.content = apiResponseJson[scope.d.privateDash.data_container][i];
                  

                  tmp_con.push({
                    _scope: _scope,
                    html: begin,
                    id: _scope.$id
                  });

                  // $('#'+scope.d.privateDash.id + ' .flipsnap').append($compile(begin)(_scope));
                  // scope.d.privateDash.content.push(_scope.$id);
                }

                else {

                  begin += end;
                  var _scope = scope.$new();
                  _scope.content = apiResponseJson[scope.d.privateDash.data_container][i];
                  
                  scope.d.content.push(_scope.$id);


                  $('#'+scope.d.id + ' .flipsnap').append($compile(begin)(_scope));
                }
                // scope.d.privateDash.content.push(_scope.$id);

              };
              // content.splice(0, 10);

              scope.d.privateDash.content = content;
              scope.attachFlipsnap();
              scope.safeApply();
              // scope.$broadcast('resize');
          })
          .error(function(error, code) {
            if (error == 404 || code == 404) scope.d.notFound = true;
          });
        };

        function ajax(url, callback) {
          
          var xhr = new XMLHttpRequest();

          if ("withCredentials" in xhr) {
            xhr.open('GET', url, true);
          } 
          else if (typeof XDomainRequest != "undefined") {
            xhr = new XDomainRequest();
            xhr.open('GET', url);

          } 
          else {

            // Otherwise, CORS is not supported by the browser.
            throw 'call not supported'
            xhr = null;
          }
          xhr.onload = function() {
           var responseText = xhr.responseText;
           // console.log(responseText);
          };

          xhr.withCredentials = true;
          xhr.send();
        };

        if (scope.d.title == 'Private Dash') {

          if (scope.d.selected_setting) {
            setTimeout(function(){
              $('#' + scope.d.id + ' .spinner').show();
            }, 0);
            $http.get('/content?t='+scope.d.title+'&s='+scope.d.selected_setting+'&skip='+scope.skip)
            .success(function(data){
              // $('#' + scope.d.id + ' .spinner').hide();
              scope.d.notFound = null;
              scope.d.privateDash = data;
              apiCall(data);
            })
            .error(function(error, code) { 
              $('#' + scope.d.id + ' .spinner').hide();
              if (code == 404) {
                scope.d.notFound = true;
              }
            });
          }
          else {
            setTimeout(function(){
              $('#' + scope.d.id + ' .spinner').hide();
            }, 0);
          }
        }
        else {
        }
      }
    };
  }]);