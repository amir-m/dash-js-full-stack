module.exports = function(express, app, mongoose, cookie, models, redisClient) {
	// access_token=CAAJXenXN2zMBAKpUjwh3Pe9c2Xr0GLhUmJ5axJn5Xictg5aFIpaYFkC344FLEd22NPZB9VdlLnIdcHPL4ikO8R1QZCzqys0e4omcAyoiONjjFYaB6zfjAv0ZB4eZBdZAVWMOZCQPenVGfct78MoPfdw7rUZCl2ZCD88i0BhlzKvhdzUoG5Vm0pzO
	var async = require('async');

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
	app.set('port', process.env.PORT || 80);
	// app.configure(function(){
	// 	// app.use(app.logger)
	// });

	var helpers = require('./helpers')(models, redisClient);

	app.use(function(req, res, next){

		// console.log('req.path:');


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
			if (!req.headers['x-latitude'] || !req.headers['x-longitude'] || !req.headers['x-userid']) {
				// return res.redirect('http://dashbookapp.com');
				if (!req.query.uuid || !req.query.lat || !req.query.lon)
					return next();
				else {
					var uuid = req.query.uuid,
						lat = parseFloat(req.query.lat),
						lon = parseFloat(req.query.lon);
				}
			}
			else {
				var uuid = req.headers['x-userid'],
					lat = parseFloat(req.headers['x-latitude']),
					lon = parseFloat(req.headers['x-longitude']);
			}

			// uuid is hashed 
			if (uuid.indexOf('-') != -1) {
				uuid = helpers.getBase64Encoding(uuid);
			};

			// redisClient.publish('initialize', lat+'|'+lon+'|'+uuid);

			async.waterfall([
				function(callback) {

					redisClient.hgetall('user:'+uuid, function(error, user){
				
						if (error) {
							res.send(500);
							throw error;
						}

						callback(null, user);
					});
				},
				function(user, callback) {
					
					// TODO: add platform (i.e. iPhone, iPad, android)
					// New Dashbook User 
					if (!user) {
						// TODO: Detect the user-agent in a better way...
						var platform = req.headers['user-agent'].indexOf('iPhone') != -1 ? 'iPhone' : 'iPad';

						models.User.create({
							uuid: uuid,
							lat: lat,
							lon: lon,
							dashes: '',
							platform: platform,
							app_first_launch_at: new Date().getTime(),
							created_at: new Date().getTime(),
						});

						callback(null);

					}
					// User Exist, check the session
					else {
						models.Session.createOrUpdate({
							uuid: uuid,
							lat: lat,
							lon: lon,
							created_at: new Date().getTime().toString()
						});
						callback(null);
					}
				},
				function(callback) {
					res.cookie('uuid', uuid, { maxAge: 100*60*1000, httpOnly: false });
					res.cookie('latitude', lat, { maxAge: 100*60*1000, httpOnly: false });
					res.cookie('longitude', lon, { maxAge: 100*60*1000, httpOnly: false });
					next();
				}
			]);

			// models.UserDash.findOne({ user: uuid }, function(error, user){
			// 	console.log('about to find dashes of ', uuid);
			// 	if (error) return console.log(error);

			// 	if (!user) {
			// 		// require('./helpers')(models).createDefaultDashes(uuid);
			// 	};
			// });
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


// hmset user:NEYxOEU4NjctMjQzOS00NzMzLUI0QzgtQjE4N0QxNEQzNDU3 created_at 1400561882934 uuid NEYxOEU4NjctMjQzOS00NzMzLUI0QzgtQjE4N0QxNEQzNDU3 status 1 dashes ''