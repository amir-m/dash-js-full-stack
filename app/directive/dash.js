'use strict';

angular.module('DashbookApp')
  .directive('dash', [
  '$http', '$timeout', '$rootScope',
  function ($http, $timeout, $rootScope) {
    return {
      restrict: 'E',
      replace: true,
      // templateUrl: '//s3.amazonaws.com/dbk-assets/dash.html', 
      templateUrl: '/partials/dash.html', 
      link: function (scope, element, attrs) {
        
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

        // console.log(scope.d)

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

          $http.get('/content?t='+scope.d.title+'&s='+scope.d.selected_setting+'&skip='+scope.skip)
          .success(function(data){
            console.log(data);
            return;
            if (data.content.length == 0) return showEmptyContent();

            if (scope.d.dashType == 'geo') return calculateScalar(data);

            scope.d.content = data.content;
            scope.skip = data.skip;
            scope.safeApply();

            attachFlipsnap();

            $('#' + scope.d.id + ' .spinner').hide();
          })
          .error(function(error) { 
            throw error; 
          });

        }

        var flipped = false;

        function tog(v){return v?'addClass':'removeClass';} 

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
            // if (scope.d.selected_setting == $('#' + scope.d.id + '-input-text').val()) {
            //   $('#' + scope.d.id + ' .spinner').hide();
            //   scope.flipSettings();
            //   return;
            // }
            scope.d.selected_setting = $('#' + scope.d.id + '-input-text').val();
            scope.d.selected_setting = scope.d.selected_setting.toLowerCase();

            var __id = null;
            var colName = scope.d.content ? scope.d.content.colName : scope.d.title
            if (scope.d.content && scope.d.content.id)
              __id = scope.d.content.id;
            $http.post('/dashes/'+scope.d.id+'/settings', {
              textInput: scope.d.selected_setting,
              uuid: scope.uuid,
              settingType: 'textInput',
              title: scope.d.title,
              skip: 0,
              sid: $rootScope.sid,
              latitude: $rootScope.latitude,
              longitude: $rootScope.longitude,
              content_id: __id,
              colName: colName,
              timestamp: new Date().getTime()
            }).success(function(data){
              ++totalFetches;
              scope.flipSettings();
              if (data.needCallBack) {
                scope.d.content = [];
                scope.skip = data.skip;
                // console.log(data)
                scheduleContentFecth(data.callBackInterval);
              }
              else {
                if (scope.d.dashType == 'geo') return calculateScalar(data);
                totalFetches = 0;
                scope.skip = data.skip;

                scope.d.content = data.content;
                $('#' + scope.d.id + ' .spinner').hide();
                attachFlipsnap();
                scope.safeApply();
              }
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
            var colName = scope.d.content ? scope.d.content.colName : scope.d.title
            if (scope.d.content && scope.d.content.id)
              __id = scope.d.content.id;
            $http.post('/dashes/'+scope.d.id+'/settings', {
              textInput: scope.d.selected_setting,
              uuid: scope.uuid,
              settingType: 'textInput',
              title: scope.d.title,
              skip: 0,
              sid: $rootScope.sid,
              latitude: $rootScope.latitude,
              longitude: $rootScope.longitude,
              content_id: __id,
              colName: colName,
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
          var selectedTime = new Date().getTime();
            scope.flipSettings()
            $('#' + scope.d.id + ' .spinner').show();

            scope.d.selected_setting = scope.d.settings[index];

            $http.post('/dashes/'+scope.d.id+'/settings', {
              selected_setting: scope.d.selected_setting,
              uuid: scope.uuid,
              settingType: 'radio',
              sid: $rootScope.sid,
              latitude: $rootScope.latitude,
              longitude: $rootScope.longitude,
              timestamp: new Date().getTime()
            }).success(function(data){
              if (new Date().getTime() - selectedTime > 1000) {
                $('#' + scope.d.id).addClass('loading');
                scope.d.content = data.content;
                scope.skip = data.skip;
                $('#' + scope.d.id + ' .spinner').hide();
                
                attachFlipsnap();
                scope.safeApply();
              }
              else {
                $timeout(function(){
                  scope.d.content = data.content;
                  scope.skip = data.skip;
                  $('#' + scope.d.id).removeClass('loading');
                  $('#' + scope.d.id + ' .spinner').hide();
                  scope.safeApply();
                  attachFlipsnap();
                }, 1000 - (new Date().getTime() - selectedTime));
              }
            })
            .error(function(error){
              // console.log(error);
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
            $('#'+scope.d.id+'-remove-btn').addClass("expand");
            return;
          };
          scope.d.removeRequested = true;
          $(document).find(".expand").removeClass("expand");
          $('#' + scope.d.id + '-remove-btn').addClass('expand');

          $http.delete('/dashes/'+scope.d.id).success(function(){

            scope.deleteDash(scope.d);
            $('#' + scope.d.id ).hide();
            $('#' + scope.d.id ).remove();
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
            col_name: content.colName,
            timestamp: new Date().getTime()
          });
        }

        function attachFlipsnap() {

          flipsnap = Flipsnap('#'+scope.d.id+ ' .flipsnap');
          
          setTimeout(function(){
            flipsnap.refresh();
            // pointer = $('.slide-indicator span'); 
            pointer = $('#pointer-'+scope.d.id+' span'); 
            if (!scope.d.content || scope.d.content.length == 0) return;
            $('#'+scope.d.id+scope.d.content[0].id).addClass('current');
            flipsnap.element.addEventListener('fspointmove', function() {
              pointer.filter('.current').removeClass('current');
              pointer.eq(flipsnap.currentPoint).addClass('current');
            }, false);
          }, 0);
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
          
        }

      }
    };
  }]);