'use strict';

angular.module('DashbookApp')
  .directive('dash', [
  '$http', '$timeout', '$rootScope',
  function ($http, $timeout, $rootScope) {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: '//s3.amazonaws.com/dbk-assets/dash.html',
      link: function (scope, element, attrs) {
        // console.log(window.document.cookie)

        $('#sortable').prop( "disabled", true );

        $(element).mousedown(function(e) {
          clearTimeout(this.downTimer);
          this.downTimer = setTimeout(function() {
            $('#sortable').prop( "disabled", false );
            // console.log(scope.d._id);
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

        $http.get('/content?t='+scope.d.title+'&s='+scope.d.selectedSetting+'&skip='+scope.skip)
        .success(function(data){
          if (data.content.length == 0) return showEmptyContent();

          if (scope.d.dashType == 'geo') return calculateScalar(data);

          scope.d.content = data.content;
          scope.skip = data.skip;
          scope.safeApply();

          attachFlipsnap();

          $('#' + scope.d._id + ' .spinner').hide();
        })
        .error(function(error){throw error;});
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
          if ($('#' + scope.d._id + '-input-text').val()) {
            $('#' + scope.d._id + ' .spinner').show();
            // if (scope.d.selectedSetting == $('#' + scope.d._id + '-input-text').val()) {
            //   $('#' + scope.d._id + ' .spinner').hide();
            //   scope.flipSettings();
            //   return;
            // }
            scope.d.selectedSetting = $('#' + scope.d._id + '-input-text').val();
            scope.d.selectedSetting = scope.d.selectedSetting.toLowerCase();
            var __id = null;
            var colName = scope.d.content ? scope.d.content.colName : scope.d.title
            if (scope.d.content && scope.d.content._id)
              __id = scope.d.content._id;
            $http.post('/dashes/'+scope.d._id+'/settings', {
              textInput: scope.d.selectedSetting,
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
                $('#' + scope.d._id + ' .spinner').hide();
                attachFlipsnap();
                scope.safeApply();
              }
            })
            .error(function(error){
              // console.log(error);
            });
          }
          else return;
        };

        scope.selectSetting = function(index) {
          var selectedTime = new Date().getTime();
            scope.flipSettings()
            $('#' + scope.d._id + ' .spinner').show();

            scope.d.selectedSetting = scope.d.settings[index];

            $http.post('/dashes/'+scope.d._id+'/settings', {
              selectedSetting: scope.d.selectedSetting,
              uuid: scope.uuid,
              settingType: 'radio',
              sid: $rootScope.sid,
              latitude: $rootScope.latitude,
              longitude: $rootScope.longitude,
              timestamp: new Date().getTime()
            }).success(function(data){
              if (new Date().getTime() - selectedTime > 1000) {
                $('#' + scope.d._id).addClass('loading');
                scope.d.content = data.content;
                scope.skip = data.skip;
                $('#' + scope.d._id + ' .spinner').hide();
                
                attachFlipsnap();
                scope.safeApply();
              }
              else {
                $timeout(function(){
                  scope.d.content = data.content;
                  scope.skip = data.skip;
                  $('#' + scope.d._id).removeClass('loading');
                  $('#' + scope.d._id + ' .spinner').hide();
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
            $('#' + scope.d._id ).removeClass('flip');
            scope.d.removeRequested = false;
            $('#' + scope.d._id + '-remove-btn').removeClass('expand');
          }
          else {
            $('#' + scope.d._id ).addClass('flip');
          }

          flipped = !flipped;
        };

        scope.removeDash = function() {

          if (!scope.d.removeRequested) {
            scope.d.removeRequested = true;
            $(document).find(".expand").removeClass("expand");
            $('#'+scope.d._id+'-remove-btn').addClass("expand");
            return;
          };
          scope.d.removeRequested = true;
          $(document).find(".expand").removeClass("expand");
          $('#' + scope.d._id + '-remove-btn').addClass('expand');

          $http.delete('/dashes/'+scope.d._id).success(function(){

            scope.deleteDash(scope.d);
            $('#' + scope.d._id ).hide();
            $('#' + scope.d._id ).remove();
            scope.safeApply();
          
          })
          .error(function(error){
            // console.log(error);
          });
        };

        scope.uriOpened = function(content) {
          $http.post('/readcontent', {
            uuid: $rootScope.uuid,
            sid: $rootScope.sid,
            latitude: $rootScope.latitude,
            longitude: $rootScope.longitude,
            content_id: content._id,
            colName: content.colName,
            timestamp: new Date().getTime()
          });
        }

        function attachFlipsnap() {

          flipsnap = Flipsnap('#'+scope.d._id+ ' .flipsnap');
          
          setTimeout(function(){
            flipsnap.refresh();
            // pointer = $('.slide-indicator span'); 
            pointer = $('#pointer-'+scope.d._id+' span'); 
            if (!scope.d.content || scope.d.content.length == 0) return;
            $('#'+scope.d._id+scope.d.content[0]._id).addClass('current');
            flipsnap.element.addEventListener('fspointmove', function() {
              pointer.filter('.current').removeClass('current');
              pointer.eq(flipsnap.currentPoint).addClass('current');
            }, false);
          }, 0);
        };

        function scheduleContentFecth(interval) {
          setTimeout(function(){
            $http.get('/content?t='+scope.d.title+'&s='+scope.d.selectedSetting+'&skip='+scope.skip)
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
                $('#' + scope.d._id + ' .spinner').hide();
                // scheduleContentFecthAndAppend(5000);
                attachFlipsnap();
              }

            })
          }, interval);
        };

        function showEmptyContent() {
          // console.log('empty');
          $('#' + scope.d._id + ' .spinner').hide();
        };

        function scheduleContentFecthAndAppend(interval) {

          setTimeout(function(){
            $http.get('/content?t='+scope.d.title+'&s='+scope.d.selectedSetting+'&skip='+scope.skip)
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

          if (scope.d.dashType == 'geo' && !scope.d.selectedSetting)
            return 'Current Location';
          else
            return scope.d.selectedSetting;
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
          $('#' + scope.d._id + ' .spinner').hide();
          attachFlipsnap();
        };

        function toRad(num) {
          return num * (Math.PI / 180); 
        };

      }
    };
  }]);