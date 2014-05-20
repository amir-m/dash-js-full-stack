module.exports = function (models, publisher, cookie) {
	
	var init = function (req, res, next) {
		
	};

	var exit = function (req, res, next) {

		res.set('Content-Type', 'application/json');
		
		if (!req.body) {
			console.log('bad exit req');
			return res.send(401);
		};

		var uuid = req.body['x-userid'],
			lat = parseFloat(req.body['x-latitude']),
			lon = parseFloat(req.body['x-longitude'])

		if (!uuid || !lat ||!lon) {
			console.log('bad exit req');
			return res.send(401);
		};

		var endTime = new Date(req.body['x-time']).getTime() || new Date().getTime();
		console.log('exit %s', uuid, endTime);

		models.users.UserSession.findOne({uuid: uuid}, 
		function(error, session){
				
			if (error) {
				console.log(error);
				return res.send(500);
			}
			if (!session) {
				console.log('Invalid session exit request %s', uuid);
				return res.send(401);
			}

			console.log(session._id);

			session.isActive = false;
			session.endTime = endTime;
			session.duration = endTime - session.beginTime;
			session.save(function(error){
				if (error) {
					res.send(500);
					return console.log(error);
				}
				return res.send({success: true});
			});
		});
	};

	var update = function (req, res, next) {

		console.log(req.body);

		var time = new Date().getTime();
		if (req.headers.cookie && cookie.parse(req.headers.cookie).sid 
		&& req.headers['x-lat'] && req.headers['x-lon'] && req.headers['x-uuid']) {

			publisher.publish('initialize', lat+'|'+lon+'|'+uuid);

			res.send(200);

			models.users.UserSession.findOne({_id: cookie.parse(req.headers.cookie).sid}, 
				function(error, session){
					
					if (error) return console.log(error);
					if (!session) return console.log('Invalid session update request!');

					session.locations.push({
						latitude: parseFloat(req.headers['x-lat']),
						longitude: parseFloat(req.headers['x-long'])
					});
					
					session.updateTimes.push(time);

					session.save(function(error){

					});
			});
		}
		else res.send(400);
	};

	var relaunch = function (req, res, next) {
		console.log('relaunched....')
		res.send(200);
	};

	return {
		init: init,
		exit: exit,
		update: update,
		relaunch: relaunch
	}
}