'use strict';

angular.module('DashbookApp')
  .directive('holder', [function () {
    return {
      restrict: 'A',
      link: function postLink(scope, element, attrs) {
      	var down = false;

    //   	$('#sortable').sortable({
  		// 	axis: 'y',
  		// 	scroll: true,
  		// 	scrollSensitivity: 180

  		// });


        element.bind('mousedown', function(e){
        	// console.log('mousedown', down)
        	e.stopPropagation();
        	down = true;
        	setTimeout(enableSortable, 2000)
        });

        element.bind('mouseup', function(e){
        	// console.log('mouseup', down)
        	e.stopPropagation();
        	down = false;
        	$('#sortable').sortable('destroy');
        });

        function enableSortable() {
        	if (down) {
        	// console.log('enableSortable', down)
        		// $('#sortable').sortable('enable');
        		$('#sortable').sortable({
		  			axis: 'y',
		  			scroll: true,
		  			scrollSensitivity: 180

		  		});
        	}
        	else $('#sortable').sortable('destroy');
        }
      }
    };
  }]);
