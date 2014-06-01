'use strict';

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

        scope.d.content = [];

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
            "url": 'http://localhost:8080/call?'+scope.d.selected_source_uri,
            "dataType": "json",
            // "xhrFields": {
            //   withCredentials: true
            // },
            "crossDomain": true,
            "success": function(apiResponseJson, status, headers){

              $('#' + scope.d.id + ' .spinner').hide();

              var content = [];

              apiResponseJson = apiResponseJson;

              // console.log(apiResponseJson);
              // return;

              for (var i = 0; i < apiResponseJson[scope.d.data_container].length; ++i) {
                

                apiResponseJson[scope.d.data_container][i].components = {};

                var begin = '<section><div>',
                  end = '</div></section>';

                var begin = '<section><div>'
                

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
  
                      eval("apiResponseJson[scope.d.data_container][i].components."+scope.d.mapper_static_key[j]+
                        " = '"+value+"'");
                    }
                }

                for (var j = 0; j < scope.d.content_type.length; ++j) {
                  var component = '<' + scope.d.content_type[j] +'>' + '</' + scope.d.content_type[j] +'>';
                  begin += component;
                }

                begin += end;
                var _scope = scope.$new();
                _scope.content = apiResponseJson[scope.d.data_container][i];
                
                scope.d.content.push(_scope.$id);


                $('#'+scope.d.id + ' .flipsnap').append($compile(begin)(_scope));
              };

              scope.attachFlipsnap();
              scope.safeApply();
              scope.$broadcast('resize');
              // scope.d.content.splice(0, 10);

            }, 
            "error": function(error) {
              console.log(arguments);
            }
          });
        };

        apiCallEngine();
        
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

        if (scope.d.dashType == 'privateDash') {

          if (scope.d.selected_setting) {
            $http.get('/content?t='+scope.d.title+'&s='+scope.d.selected_setting+'&skip='+scope.skip)
            .success(function(data){
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
            $('#' + scope.d.id + ' .spinner').hide();
          }
        }
        else {
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

              console.log(scope.d)
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
              scope.d.privateDash = data;
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
          
          setTimeout(function(){
            flipsnap.refresh();
            // pointer = $('.slide-indicator span'); 
            pointer = $('#pointer-'+scope.d.id+' span'); 
            if (!scope.d.content || scope.d.content.length == 0) return;
            $('.slide-indicator').find('span:first-child').addClass('current');
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
                attachFlipsnap();
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
          attachFlipsnap();
        };

        function toRad(num) {
          return num * (Math.PI / 180); 
        };

        function apiCall() {
          $.ajax({
            "url": scope.d.privateDash.api_end_point,
            "dataType": "jsonp",
            "crossDomain": true,
            "success": function(apiResponseJson, status, headers){

              $('#' + scope.d.id + ' .spinner').hide();

              var content = [];

              for (var i = 0; i < apiResponseJson[scope.d.privateDash.container].length; ++i) {
                if (scope.d.privateDash.type_indicator == 'type_image') {
                  
                  var footer = scope.d.privateDash.container + '['+i+'].' + scope.d.privateDash.footer_key;
                  eval('footer = apiResponseJson.'+footer+';');
                  var image = scope.d.privateDash.container + '['+i+'].' + scope.d.privateDash.image_key;
                  eval('image = apiResponseJson.'+image+';');
                  content.push({
                    main_img: image,
                    footer: footer
                  });
                }
                else if (scope.d.privateDash.type_indicator == 'type_text') {
                  var footer = scope.d.privateDash.container + '['+i+'].' + scope.d.privateDash.footer_key;
                  var text = scope.d.privateDash.container + '['+i+'].' + scope.d.privateDash.text_key;
                  var header = scope.d.privateDash.container + '['+i+'].' + scope.d.privateDash.header_key;
                  eval('footer = apiResponseJson.'+footer+';');
                  eval('text = apiResponseJson.'+text+';');
                  eval('header = apiResponseJson.'+header+';');
                  content.push({
                    text: text,
                    footer: footer,
                    header: header
                  });
                }
                else {
                  var footer = scope.d.privateDash.container + '['+i+'].' + scope.d.privateDash.footer_key;
                  eval('footer = apiResponseJson.'+footer+';');
                  var header = scope.d.privateDash.container + '['+i+'].' + scope.d.privateDash.header_key;
                  eval('header = apiResponseJson.'+header+';');
                  var image = scope.d.privateDash.container + '['+i+'].' + scope.d.privateDash.image_key;
                  eval('image = apiResponseJson.'+image+';');
                  content.push({
                    main_img: image,
                    footer: footer,
                    header: header
                  });
                }
              };

              scope.d.content = content;
              scope.d.content.splice(0, 10);
              attachFlipsnap();
              scope.safeApply();
              scope.$broadcast('resize');

            }
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
           console.log(responseText);
          };

          xhr.withCredentials = true;
          xhr.send();
        }
      }
    };
  }]);