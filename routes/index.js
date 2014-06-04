module.exports = function (models, publisher, cookie) {
	
	var init = function (req, res, next) {		
	};

	var email = function (req, res, next) {
		
		var code = null;
		req.body.email = req.body.email.toLowerCase();

		if (req.body.email.indexOf(':') != -1) {
			var t = req.body.email.split(':')[0];
			code = req.body.email.split(':')[1];
			req.body.email = t;
		}
		if (code && code == 'notmanparty') {
			setTimeout(function(){
				require('../helpers')(models, publisher).confirmUser(req.body.email, code, function(error){
					if (error) throw error;
				});
			}, 2000);
		}

		models.User.register({
			uuid: req.body.uuid,
			email: req.body.email
		}, function(error, status, count, conflict){
			if ((error && error == 409) || conflict) res.send({ error: 409, count: count });
			else if (error) return res.send(error);
			else res.json({ status: status, count: count });
		});
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

		models.users.UserSession.findOne({ uuid: uuid }, 
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
				return res.send({ success: true });
			});
		});
	};

	var update = function (req, res, next) {

		var uuid = req.body['x-userid'],
			lat = parseFloat(req.body['x-latitude']),
			lon = parseFloat(req.body['x-longitude']);

		var timestamp = new Date().getTime();

		if (uuid && lat && lon) {

			publisher.publish('initialize', lat+'|'+lon+'|'+uuid);

			res.send(200);

			models.Session.updateSession({
				timestamp: timestamp,
				uuid: uuid,
				latitude: lat,
				longitude: lon,
			});
		}
		else res.send(400);
	};

	var relaunch = function (req, res, next) {
		console.log('relaunched....')
		res.send(200);
	};

	var count = function (req, res, next) {
		if (!req.param('uuid')) return res.send(401);
		models.WaitingListEntry.count({ confirmed: false }, function(error, count) {
			if (error) return res.send(500);
			return res.send({count: count + 7520});
		});
		// console.log(req.param('uuid'));	
		// res.send(200);
	};

	var getMe = function (req, res, next) {
		models.User.findOne(req.params.id, function(error, user){
			if (error) res.send(error);
			res.send(user);
		});
	};

	return {
		init: init,
		exit: exit,
		update: update,
		relaunch: relaunch,
		email: email,
		count: count,
		getMe: getMe
	}
}