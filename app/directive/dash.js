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

        $('article').addClass('slide-up');

        setTimeout(function (argument) {
          $('article').removeClass('slide-up');
        }, 1000);

        scope.d.content = [], scope.flipTo = 1, scope.currentPoint = null;

        function apiCallEngine(append) {
          
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

              var content = [], tmp_con = [], container;
              scope.d.content = scope.d.content || [];

              if (scope.d.source_return_type == 'json') {

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
                    if (todays[i].status == 'LIVE') {
                      index = todays[i].id;
                      break;
                    }
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

                  if (apiResponseJson[scope.d.data_container].length > 20) 
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
                    if (scope.d.source_return_type == 'json') {
                      if (scope.d.mapper_value[j].indexOf('.') != -1) {
                        value = '';
                        var values = scope.d.mapper_value[j].split('.');
                        for (var k = 0; k < values.length; ++k) {
                          value += values[k];
                          if (k != values.length -1) value += '.';
                        }
                      }

                      try{
                        eval("apiResponseJson[scope.d.data_container][i].components."+scope.d.mapper_key[j]+
                        " = apiResponseJson[scope.d.data_container][i]." + value);
                      }
                      catch(error) {
                        throw error;
                      }
                    }
                    else {
                      try{
                        eval("apiResponseJson[scope.d.data_container][i].components."+scope.d.mapper_key[j]+
                        " = apiResponseJson[scope.d.data_container][i]" + value);
                      }
                      catch(error) {
                        throw error;
                      }
                    }
                  }

                  if (scope.d.mapper_static_key) {
                      for (var j = 0; j < scope.d.mapper_static_key.length; ++j) {
                        
                        var value = scope.d.mapper_static_value[j];
                        try{
                          eval("apiResponseJson[scope.d.data_container][i].components."+scope.d.mapper_static_key[j]+
                            " = '"+value+"'");
                        }
                        catch(error) {
                          throw error;
                        }
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

                    // console.log(begin);

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

              }
              else {

              }
              scope.flipsnap_width = scope._width*scope.d.content.length;
              if (append) {
                  scope.appendFlipsnap();
              } 
              else {
                scope.attachFlipsnap();
              }
              scope.safeApply();
              if (scope.d.title == 'Private Dash') 
                scope.d.components_settings = scope.d.private_dash.components_settings;
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
          scope.settings_input_value
            if (scope.settings_input_value) {
              $('#' + scope.d.id + ' .spinner').show();
              var selected_setting = scope.settings_input_value;

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

        scope.setPrivateDash = function() {
          if (scope.settings_input_value) {
            $('#' + scope.d.id + ' .spinner').show();
            scope.d.selected_setting = scope.settings_input_value;
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
              scope.d.dash_has_been_set = true;
              scope.d.content = []
              $('#'+scope.d.id + ' .flipsnap').empty();
              scope.d.private_dash = data.private_dash;
              apiCall();
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

        scope.selectSetting = function(index, flip, manual) {
          if (manual) {
            scope.d.content = [];
            $('#'+scope.d.id + ' .flipsnap').empty();
            scope.$broadcast('suicide');
            scope.currentPoint = 0;
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
          }

          scope.d.selected_source_uri = scope.d.source_uri[index];
          scope.d.selected_setting = scope.d.settings[index];
          apiCallEngine(true);
          if ( flip ) scope.flipSettings();
          $('#' + scope.d.id + ' .spinner').show();
          scope.d.selected_setting = scope.d.settings[index];

        };

        scope.selectPrivateSetting = function(index, flip, manual) {

          if (manual) {
            scope.d.content = [];
            $('#'+scope.d.id + ' .flipsnap').empty();
            scope.$broadcast('suicide');
            scope.currentPoint = 0;
            $http.post('/dashes/'+scope.d.id+'/settings', {
              selected_setting: scope.d.private_dash.selected_setting,
              selected_source_uri: scope.private_dash.d.selected_source_uri,
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
          }
          scope.d.private_dash.selected_source_uri = scope.d.private_dash.source_uri[index];
          scope.d.private_dash.selected_setting = scope.d.private_dash.settings[index];
          // console.log('-------------------in selectPrivateSetting')
          // console.log(index)
          // console.log(scope.d.private_dash.source_uri[index])
          // console.log(scope.d.private_dash.settings[index])
          // console.log(scope.d.private_dash.selected_setting)
          // console.log('-------------------in selectPrivateSetting')
          apiCall(true);
          if ( flip ) scope.flipSettings();
          $('#' + scope.d.id + ' .spinner').show();        
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
          
          $('#'+scope.d.id+' .slide-indicator').hide();

          flipsnap = Flipsnap('#'+scope.d.id+ ' .flipsnap');

          flipsnap.moveToPoint(scope.flipTo - 1);

          setTimeout(function(){

            $('#'+scope.d.id+' .slide-indicator').show();

            flipsnap.refresh();

            pointer = $('#pointer-'+scope.d.id+' span'); 

            if (!scope.d.content || scope.d.content.length == 0) return;

            $('#'+scope.d.id+' .slide-indicator span:gt(9)').hide();
            
            if (scope.d.content.length > 10) {
              $('#'+scope.d.id+' .slide-indicator .plus').show();
            };

            pointer.eq(flipsnap.currentPoint).addClass('current');

            flipsnap.element.addEventListener('fspointmove', function() {

              scope.currentPoint = flipsnap.currentPoint;

              console.log(scope.currentPoint)
              
              pointer.filter('.current').removeClass('current');
              pointer.eq(flipsnap.currentPoint).addClass('current');

              if (flipsnap.currentPoint > 9) {
                $('.slide-indicator .plus').addClass('current');
              }

            }, false);
          }, 25);
        };

        scope.appendFlipsnap = function() {
          
          // $('#'+scope.d.id+' .slide-indicator').hide();

          flipsnap = Flipsnap('#'+scope.d.id+ ' .flipsnap');
          // flipsnap.moveToPoint(scope.currentPoint, 10000);

          setTimeout(function(){
            flipsnap.refresh();
            flipsnap.moveToPoint(scope.currentPoint, 0);
            $('#'+scope.d.id+' .slide-indicator span:gt(9)').hide();
              if (scope.d.content.length > 10) {
                $('#'+scope.d.id+' .slide-indicator .plus').show();
              };

              pointer.eq(flipsnap.currentPoint).addClass('current');

              flipsnap.element.addEventListener('fspointmove', function() {
                
                pointer.filter('.current').removeClass('current');
                pointer.eq(flipsnap.currentPoint).addClass('current');

                scope.currentPoint = flipsnap.currentPoint;
                
                if (flipsnap.currentPoint > 9) {
                  $('.slide-indicator .plus').addClass('current');
                }
              }, false);

          }, 25);

          // flipsnap.moveToPoint(scope.flipTo - 1);

          // setTimeout(function(){

          //   $('#'+scope.d.id+' .slide-indicator').show();

          //   flipsnap.refresh();

          //   pointer = $('#pointer-'+scope.d.id+' span'); 

          //   if (!scope.d.content || scope.d.content.length == 0) return;

          //   $('#'+scope.d.id+' .slide-indicator span:gt(9)').hide();
            
          //   if (scope.d.content.length > 9) {
          //     $('#'+scope.d.id+' .slide-indicator .plus').show();
          //   };

          //   pointer.eq(flipsnap.currentPoint).addClass('current');

          //   flipsnap.element.addEventListener('fspointmove', function() {
              
          //     pointer.filter('.current').removeClass('current');
          //     pointer.eq(flipsnap.currentPoint).addClass('current');

          //     if (flipsnap.currentPoint > 9) {
          //       $('.slide-indicator .plus').addClass('current');
          //     }

          //   }, false);
          // }, 25);
        };        

        scope.isPrivateDashSettings = function () {
          return scope.d.title == 'Private Dash' && scope.d.dash_has_been_set;
        };

        scope.isNotPrivateDashSettings = function () {
          return scope.d.title != 'Private Dash' || (scope.d.title == 'Private Dash' && !scope.d.dash_has_been_set);
        };

        scope.updatePrivateDashSettings = function () {
          if (scope.d.private_dash.setting_type == 'textInput' && (!scope.private_dash_settings_input_value || scope.private_dash_settings_input_value.length == 0)) {
            return;
          }
          scope.d.private_dash.selected_setting = scope.private_dash_settings_input_value;
          apiCall();
          $http.post('/dash/private/'+scope.d.id+'/settings',{
            setting_type: scope.d.private_dash.setting_type,
            selected_setting: scope.d.private_dash.selected_setting,
            uuid: scope.uuid,
            latitude: $rootScope.latitude,
            longitude: $rootScope.longitude,
            timestamp: new Date().getTime()
          })
          .success(function () {
            scope.flipSettings();
          })
          .error(function () {
            throw error;
          })
        };

        scope.getWidth = function () {
          return 'width:'+scope._width*scope.d.content.length+'px;'
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

        function apiCall(append) {
          
          if (scope.d.private_dash.source_uri_scheme && scope.d.private_dash.source_uri_scheme.length > 0) {
            scope.d.private_dash.selected_source_uri = scope.d.private_dash.source_uri_scheme.length == 1 ? scope.d.private_dash.source_uri_scheme[0] : scope.d.private_dash.source_uri_scheme[scope.d.private_dash.settings.indexOf(scope.d.private_dash.selected_setting)];
          }
          else {
            scope.d.private_dash.selected_source_uri = scope.d.private_dash.source_uri.length == 1 ? scope.d.private_dash.source_uri[0] : scope.d.private_dash.source_uri[scope.d.private_dash.settings.indexOf(scope.d.private_dash.selected_setting)];
          }

          if (scope.d.private_dash.source_uri_keys && scope.d.private_dash.source_uri_keys.length > 0) {
            if (scope.d.private_dash.source_uri_keys.indexOf('{latitude}') != -1) {
              scope.d.private_dash.selected_source_uri = scope.d.private_dash.selected_source_uri.replace('{latitude}', scope.latitude);
              // scope.d.private_dash.source_uri_keys.splice(scope.d.private_dash.source_uri_keys.indexOf('{latitude}'), 1);
              // scope.d.private_dash.source_uri_values.splice(0, 1);
            }
            if (scope.d.private_dash.source_uri_keys.indexOf('{longitude}') != -1) {
              scope.d.private_dash.selected_source_uri = scope.d.private_dash.selected_source_uri.replace('{longitude}', scope.longitude);
              // scope.d.private_dash.source_uri_keys.splice(scope.d.private_dash.source_uri_keys.indexOf('{longitude}'), 1);
              // scope.d.private_dash.source_uri_values.splice(0, 1);
            }
            // if (scope.d.private_dash.source_uri_keys.indexOf('{selected_setting}') != -1) {
            //   scope.d.private_dash.selected_source_uri = scope.d.private_dash.selected_source_uri.replace('{selected_setting}', scope.d.private_dash.selected_setting);
            // }
            if (scope.d.private_dash.source_uri_keys.indexOf('{selected_setting}') != -1) {
              scope.d.private_dash.selected_source_uri = scope.d.private_dash.selected_source_uri.replace('{selected_setting}', scope.d.private_dash.selected_setting);
            }
            for (var i = 0; i < scope.d.private_dash.source_uri_keys.length; ++i) {
              if (scope.d.private_dash.source_uri_keys[i] != '{latitude}' && scope.d.private_dash.source_uri_keys[i] != '{longitude}' && scope.d.private_dash.source_uri_keys[i] != '{selected_setting}')
                scope.d.private_dash.selected_source_uri = scope.d.private_dash.selected_source_uri.replace(scope.d.private_dash.source_uri_keys[i], scope.d.private_dash.source_uri_values[i]);
            }
          };

          $http.get(scope.engine_uri + scope.d.private_dash.selected_source_uri)
          .success(function(apiResponseJson, status, headers){
            var content = [], container;
            scope.d.content = scope.d.content || [];
            if (scope.d.content.length == 0) $('#'+scope.d.id + ' .flipsnap').empty();
            if (scope.d.private_dash.source_return_type == 'json') {
              if (apiResponseJson[scope.d.private_dash.data_container].length > 20) 
                    apiResponseJson[scope.d.private_dash.data_container] = apiResponseJson[scope.d.private_dash.data_container].splice(0, 10);
              
              for (var i = 0; i < apiResponseJson[scope.d.private_dash.data_container].length; ++i) {
                                
                apiResponseJson[scope.d.private_dash.data_container][i].components = {};

                var begin = '<section><div>',
                  end = '</div></section>';                

                for (var j = 0; j < scope.d.private_dash.content_type.length; ++j) {
                  apiResponseJson[scope.d.private_dash.data_container][i].components[scope.d.private_dash.content_type[j]] = {};
                }

                
                for (var j = 0; j < scope.d.private_dash.mapper_key.length; ++j) {
                  var value = scope.d.private_dash.mapper_value[j];
                  if (scope.d.private_dash.mapper_value[j].indexOf('.') != -1) {
                    value = '';
                    var values = scope.d.private_dash.mapper_value[j].split('.');
                    for (var k = 0; k < values.length; ++k) {
                      value += values[k];
                      if (k != values.length -1) value += '.';
                    }
                  }
                  try {
                    eval("apiResponseJson[scope.d.private_dash.data_container][i].components."+scope.d.private_dash.mapper_key[j]+
                      " = apiResponseJson[scope.d.private_dash.data_container][i]." + value);
                  }
                  catch(error) {
                    throw error;
                  }
                }

                if (scope.d.private_dash.mapper_static_key) {
                  for (var j = 0; j < scope.d.private_dash.mapper_static_key.length; ++j) {
                    
                    var value = scope.d.private_dash.mapper_static_value[j];

                    console.log("apiResponseJson[scope.d.private_dash.data_container][i].components['"+scope.d.private_dash.mapper_static_key[j]+"']"+
                      " = '"+value+"'");
                    try {
                      eval("apiResponseJson[scope.d.private_dash.data_container][i].components['"+scope.d.private_dash.mapper_static_key[j]+"']"+
                        " = '"+value+"'");
                    }
                    catch(error) {
                      throw error;
                    }
                  }
                }

                for (var j = 0; j < scope.d.private_dash.content_type.length; ++j) {
                  var component = '<' + scope.d.private_dash.content_type[j] +'>' + '</' + scope.d.private_dash.content_type[j] +'>';
                  begin += component;
                }
                
                // TODO: Make it generic: 
                if (scope.d.private_dash.title == "Food Near Me" 
                  || scope.d.private_dash.title == "Coffee Near Me" 
                  || scope.d.private_dash.title == "Places Near Me") {
                  begin += end;
                  var _scope = scope.$new();
                  
                  _scope.content = apiResponseJson[scope.d.private_dash.data_container][i];
                  

                  tmp_con.push({
                    _scope: _scope,
                    html: begin,
                    id: _scope.$id
                  });

                  // $('#'+scope.d.private_dash.id + ' .flipsnap').append($compile(begin)(_scope));
                  // scope.d.private_dash.content.push(_scope.$id);
                }

                else {

                  begin += end;
                  var _scope = scope.$new();
                  _scope.content = apiResponseJson[scope.d.private_dash.data_container][i];
                  
                  scope.d.content.push(_scope.$id);


                  $('#'+scope.d.id + ' .flipsnap').append($compile(begin)(_scope));
                }
                // scope.d.private_dash.content.push(_scope.$id);
              };
            }
            else {
              try {
                eval('container = apiResponseJson.' + scope.d.private_dash.data_container);
              }
              catch(error) {
                throw error;
              }
              
              if (container.length > 20) 
                    container = container.splice(0, 10);
              
              for (var i = 0; i < container.length; ++i) {
                                
                container[i].components = {};

                var begin = '<section><div>',
                  end = '</div></section>';                

                for (var j = 0; j < scope.d.private_dash.content_type.length; ++j) {
                  container[i].components[scope.d.private_dash.content_type[j]] = {};
                }

                
                for (var j = 0; j < scope.d.private_dash.mapper_key.length; ++j) {
                  var value = scope.d.private_dash.mapper_value[j];
                  if (scope.d.private_dash.mapper_value[j].indexOf('.') != -1) {
                    value = '';
                    var values = scope.d.private_dash.mapper_value[j].split('.');
                    for (var k = 0; k < values.length; ++k) {
                      value += values[k];
                      if (k != values.length -1) value += '.';
                    }
                  }
                  try {
                    eval("container[i].components."+scope.d.private_dash.mapper_key[j]+
                      " = container[i]" + value);
                  }
                  catch(error) {
                    throw error;
                  }
                }

                if (scope.d.private_dash.mapper_static_key) {
                    for (var j = 0; j < scope.d.private_dash.mapper_static_key.length; ++j) {
                      
                      var value = scope.d.private_dash.mapper_static_value[j];

                      // console.log(scope.d.private_dash.mapper_static_value);
                      
                      console.log("container[i].components['"+scope.d.private_dash.mapper_static_key[j]+"']"+
                        " = '"+value+"'");
                      try {
                        eval("container[i].components['"+scope.d.private_dash.mapper_static_key[j]+"']"+
                          " = '"+value+"'");
                      }
                      catch(error) {
                        throw error;
                      }
                    }
                }

                for (var j = 0; j < scope.d.private_dash.content_type.length; ++j) {
                  var component = '<' + scope.d.private_dash.content_type[j] +'>' + '</' + scope.d.private_dash.content_type[j] +'>';
                  begin += component;
                }
                
                // TODO: Make it generic: 
                if (scope.d.private_dash.title == "Food Near Me" 
                  || scope.d.private_dash.title == "Coffee Near Me" 
                  || scope.d.private_dash.title == "Places Near Me") {
                  begin += end;
                  var _scope = scope.$new();
                  
                  _scope.content = container[i];
                  

                  tmp_con.push({
                    _scope: _scope,
                    html: begin,
                    id: _scope.$id
                  });

                  // $('#'+scope.d.private_dash.id + ' .flipsnap').append($compile(begin)(_scope));
                  // scope.d.private_dash.content.push(_scope.$id);
                }

                else {

                  begin += end;
                  var _scope = scope.$new();
                  _scope.content = container[i];
                  
                  scope.d.content.push(_scope.$id);


                  $('#'+scope.d.id + ' .flipsnap').append($compile(begin)(_scope));
                }
                // scope.d.private_dash.content.push(_scope.$id);
              };
            }
            // content.splice(0, 10);
            $('#' + scope.d.id + ' .spinner').hide();
            scope.d.private_dash.content = content;
            scope.flipsnap_width = scope._width*scope.d.content.length;
            scope.d.components_settings = scope.d.private_dash.components_settings;
            if (append) {
              scope.appendFlipsnap();
            }
            else {
              scope.attachFlipsnap();
            }
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

          // if (!scope.d.private_dash) scope.d.private_dash = {};

          if (scope.d.private_dash.setting_type == 'radio') {

            scope.$watch('currentPoint', function () {
              if (scope.currentPoint == scope.d.content.length - 2 && scope.d.private_dash.settings.length > scope.d.private_dash.settings.indexOf(scope.d.private_dash.selected_setting) + 1) {
                scope.selectPrivateSetting(scope.d.private_dash.settings.indexOf(scope.d.private_dash.selected_setting) + 1, false, false);
              }
            });
          }

          if (scope.d.private_dash) scope.private_dash_settings_input_value = scope.d.private_dash.selected_setting;

          if (scope.d.selected_setting) {
            setTimeout(function(){
              $('#' + scope.d.id + ' .spinner').show();
            }, 0);
            // $http.get('/content?t='+scope.d.title+'&s='+scope.d.selected_setting+'&skip='+scope.skip)
            // .success(function(data){
              // $('#' + scope.d.id + ' .spinner').hide();
              // scope.d.notFound = null;
              // scope.d.private_dash = data;
              // apiCall(data);
              apiCall();
            // })
            // .error(function(error, code) { 
            //   $('#' + scope.d.id + ' .spinner').hide();
            //   if (code == 404) {
            //     scope.d.notFound = true;
            //   }
            // });
          }
          else {
            setTimeout(function(){
              $('#' + scope.d.id + ' .spinner').hide();
            }, 0);
          }
        }
        else {
          
          scope.settings_input_value = scope.d.selected_setting;

          if (scope.d.setting_type == 'radio') {

            scope.$watch('currentPoint', function () {
              if (scope.currentPoint == scope.d.content.length - 2 && scope.d.settings.length > scope.d.settings.indexOf(scope.d.selected_setting) + 1) {
                scope.selectSetting(scope.d.settings.indexOf(scope.d.selected_setting) + 1, false, false);
              }
            });
          }

        };

        setTimeout(function (argument) {
          if (!scope.d.dash_has_been_set && scope.d.title == 'Private Dash') {
            scope.flipSettings();
          }
        }, 2000);
      }
    };
  }]);