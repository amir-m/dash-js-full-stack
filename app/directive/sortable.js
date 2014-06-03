'use strict';

angular.module('DashbookApp')
  .directive('sortable', ['$rootScope',
    function ($rootScope) {
    return {
      restrict: 'A',
      link: function postLink(scope, element, attrs) {
        var sortableActivated = false;
        $('#toggleSortable').css('opacity', '0.2');
      // $( element ).sortable()
  		// $( element ).sortable({
  		// 	axis: 'y',
  		// 	// handle: ".dash-title", 
  		// 	// delay: 2000,
  		// 	scroll: true,
  		// 	scrollSensitivity: 180
    //     // activate: function(event, ui) {
        //   console.log(ui)
    //     //   // ui.$('article').each(function(){
    //     //   //   $(this).addClass('jiggle');
    //     //   // });
    //     // },
    //     // deactivate: function(event, ui) {
    //     //   ui.$('article').each(function(){
    //     //     $(this).removeClass('jiggle');
    //     //   });
    //     // }
  		// });

    	// $( element ).disableSelection();

      // $( element ).sortable('disable');
      // $('#toggleSortable').click(function(){
      //   $('#toggleSortable').toggleClass('.activate');
      //   $('#toggleSortable').toggleClass('.deactivate');
      // });

      $('#toggleSortable').click(function(){
        sortableActivated = !sortableActivated;
        if (sortableActivated) {
          if (!scope.sortable)
            $( element ).sortable({
               axis: 'y',
               scroll: true,
                scrollSensitivity: 180
            });
          else {
            $( element ).sortable('enable');
          }
          // var t = []
          // $('article').each(function(){
          //   t.push(this);
          // });

          // for (var i = 0; i < t.length; ++i) {
          //   (function(i){
          //     setTimeout(function(i){
          //       t[i].addClass('jiggle');
          //     }, i * 150);
          //   }(i));
          // }

          $('article').addClass('jiggle');
          
          $rootScope.sortableEnabled = true;
          scope.sortable = true;

          $('#toggleSortable').css('opacity', '1');

          $('.gotosource').bind('click', function(e){
            e.preventDefault();
          });

        } 
        else {
          $('article').removeClass('jiggle');
          $( element ).sortable('disable');
          $('.library-btn').click(true);
          $rootScope.sortableEnabled = false;

          $('.gotosource').unbind('click');
          $('#toggleSortable').css('opacity', '0.2');
        }

      });


		element.bind('sortchange', function (event, ui) {
			setTimeout(reArrange, 1000)
		});

		function reArrange() {
			var t = [];
			$('article').each(function(){
				if ($(this).attr('id') && t.indexOf($(this).attr('id')) == -1) {
					// console.log($(this).attr('id'));
					t.push($(this).attr('id'));
				}
			});
			scope.reArrange(t);
		};

      }
    };
  }]);
