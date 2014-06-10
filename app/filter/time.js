'use strict';

angular.module('DashbookApp')
  .filter('time', [
  	'$filter', 
  	function ($filter) {
    return function (input) {
			

			var input = new Date(input).getTime();
			input = parseInt(input);

			
			if (isNaN(input)) return input ? input : '';
			
			var now = new Date(), 
				inputDate = new Date(input),
				midnight = new Date()
			
			midnight.setHours(0);
			midnight.setMinutes(0);
			midnight.setSeconds(0);
			midnight.setMilliseconds(0);
			

			var time =  ' at ' + (inputDate.getHours() == 0 ? '00' : 
				inputDate.getHours() == 12 ? '12' : inputDate.getHours() == 24 ? '00' : 
				inputDate.getHours() % 12) + ':' + (inputDate.getMinutes() < 10 ? '0' : '') 
				+ inputDate.getMinutes() + (inputDate.getHours() < 12 ? ' AM' : ' PM');

			if (inputDate.getFullYear() != now.getFullYear())
					return $filter('date')(input, 'MMM d y') + time;

			
			var nowInputDifference = now.getTime() - input, 
				nowInputDifferenceTime = new Date(nowInputDifference),
				nowMidnightDifference = now.getTime() - midnight.getTime(),
				// ms = nowInputDifference % 1000,
				h = Math.floor(nowInputDifference / (1000*60*60)),
				m = nowInputDifferenceTime.getMinutes(),
				s = nowInputDifferenceTime.getSeconds(),
				d = Math.floor(h / 24);

			if (d > 0) {

				if (d == 1) {
					
					var midnightYesterday = new Date(midnight.getTime() - 86400000);
					
					if (midnightYesterday > input)
						return $filter('date')(input, 'EEEE') + time;

					return 'Yesterday' + time; 
				}

				if (d < 7) return $filter('date')(input, 'EEEE') + time;

				return $filter('date')(input, 'MMM d') + time;
			}

			if (nowInputDifference > nowMidnightDifference)
				return 'Yesterday' + time;

			if (h > 1) return h + ' hours ago';

			if (h == 1) return '1 hour ago';

			if (m > 1) return m + ' minutues ago';

			if (m == 1) return '1 minutue ago';

			if (s > 1) return s + ' seconds ago';

			if (s == 1) return '1 second ago';

			// if (ms > 1) return ms + ' milliseconds ago';

			// if (ms == 1) return '1 millisecond ago';

			return '1 second ago'
    };
  }]);