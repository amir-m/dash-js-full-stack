stackTraceLimit = Infinity;

module.exports = function(express, app, mongoose, cookie, models, publisher) {

	var connectionString = "mongodb://admin:IuT603JamshEqplE2N&0}x!@candidate.19.mongolayer.com:10061/dbk";
	// var connectionString = "mongodb://admin:foundersfuel2013@54.214.165.124:27017/dashbook";
 
	mongoose.connect(connectionString, function(err){
		if (err) throw err;
		console.log('connected to mongoDB: %s', connectionString);
	});

	app.set('views', __dirname + '/app');
	app.use(require('body-parser')());
	app.use(require('method-override')());
	
	app.use(require('morgan')('dev'));
	app.set('port', process.env.PORT || 8080);
	// app.configure(function(){
	// 	// app.use(app.logger)
	// });

	app.use(function(req, res, next){

		// console.log('req.path:');
		// console.log(req.path);

		res.cookie('uuid', 'NEYxOEU4NjctMjQzOS00NzMzLUI0QzgtQjE4N0QxNEQzNDU3', { maxAge: 100*60*1000, httpOnly: false });
		res.cookie('sid', 'NTJhYjcwY2M3YjNhNTk3ODYxMDAwMDAx', { maxAge: 100*60*1000, httpOnly: false });
		res.cookie('latitude', '45.495744', { maxAge: 100*60*1000, httpOnly: false });
		res.cookie('longitude', '-73.563195', { maxAge: 100*60*1000, httpOnly: false });
		
		return next();
		
		// if (req.path == '/relaunch' || req.path == '/') {
		// 	console.log(req.path);
		// 	console.log(req.body);
		// 	console.log(req.headers);
		// }
		// if (req.path == '/' || req.path == '/relaunch' || req.path == '/exit' || req.path == '/update') {
		// 	console.log(req.path);
		// 	console.log(req.body);
		// 	console.log(req.headers);
		// }
		if (req.path == '/') {
			if (!req.headers['x-latitude'] || !req.headers['x-longitude'] || !req.headers['x-userid'])
				// return res.redirect('http://dashbookapp.com');
				return next();


			var uuid = req.headers['x-userid'],
				lat = parseFloat(req.headers['x-latitude']),
				lon = parseFloat(req.headers['x-longitude']);

			console.log(lat, lon, req.headers['x-time']);

			publisher.publish('initialize', lat+'|'+lon+'|'+uuid);

			models.users.UserSession.findOne({uuid: uuid, isActive: true}, function(error, session){
				if (error) {
					console.log(error);
					return res.send(500);
				};

				if (session) {
					session.isActive = false;
					session.isDefective = true;
					session.endTime = new Date().getTime();
					session.locations.push({
						latitude: parseFloat(req.headers['x-latitude']),
						longitude: parseFloat(req.headers['x-longitudeg'])
					});
					
					session.updateTimes.push(new Date().getTime());
					session.save();
				}
				var s = new models.users.UserSession({
					_id: models.users.objectId(),
					beginTime: new Date().getTime(),
					uuid: uuid,
					locations: [{
						latitude: lat,
						longitude: lon
					}],
					updateTimes: [new Date().getTime()]
				});
				console.log('about to create session for ', uuid);
				s.save(function(error){
					if (error)
						console.log(error);
					else console.log('sesssion created for user ', uuid);
					res.cookie('uuid', s.uuid, { maxAge: 100*60*1000, httpOnly: false });
					res.cookie('sid', s._id, { maxAge: 100*60*1000, httpOnly: false });
					res.cookie('latitude', lat, { maxAge: 100*60*1000, httpOnly: false });
					res.cookie('longitude', lon, { maxAge: 100*60*1000, httpOnly: false });
					next();

				});

			});

			models.dashes.UserDash.findOne({user: uuid}, function(error, user){
				console.log('about to find dashes of ', uuid);
				if (error) return console.log(error);

				if (!user) {
					require('./helpers')(models).createDefaultDashes(uuid);
				};
			});
			// next();
		}	
		else {
			// console.log(req.path);
			next()
		};
	});


	// app.get('/', function(req, res) {
	// 	console.log(req.path)
	// 	// process.stdout.write('@[logs.dashbookers] ' + JSON.stringify(requestor) + '\n');
	// 	// 365*24*60*60*1000
		
	// 	// res.cookie('ttt', 'req.cookies[_visitorId]', { maxAge: 10*60*1000, httpOnly: false });
	// 	res.render('index.html')
	// });

	app.use(express.static(__dirname + '/app'));

	// var connectionString = process.env.MONGOLAB_URI ? 
	// 	process.env.MONGOLAB_URI : 

	// redisSub.subscribe('api');

	// redisSub.on('message', function(channel, message){
	// 	console.log('got message from ', channel, ': ', message);
	// });
	
};