module.exports = function  (models, publisher) {

	// publisher.send('places:' + 'lat:45.4949025|lon:-73.5654505|term:cafe');

	var cookie = require('cookie');

	// var map = {
	// 	'Dribbble': {
	// 		'Everyone': models.EveryoneDribbleShot,
	// 		'Popular': models.PopularDribbleShot,
	// 		'Debut': models.DebutsDribbleShot
	// 	},
	// 	'News': {
	// 		'Business Insider': models.BusinessInsider,
	// 		Wired: models.Wired,
	// 		VentureBeat: models.VentureBeat,
	// 		TechCrunch: models.TechCrunch,
	// 		'New York Times': models.NewYorkTimes,
	// 		Mashable: models.Mashable,
	// 		'Inc.com': models.IncCom,
	// 		Forbes: models.Forbes,
	// 		'Fast Company': models.FastCompany,
	// 		ESPN: models.ESPN,
	// 		Core77: models.Core77,
	// 		'Design Milk': models.DesignMilk
	// 	},
	// 	'BeHance': models.Behance,
	// 	'Coffee Near Me': models.PlacesSearchResult,
	// 	'Places Near Me': models.PlacesSearchResult,
	// 	'Food Near Me': models.PlacesSearchResult,
	// 	'Sidebar.io': models.SideBarIO,
	// 	'Dribbble Stats': models.DribbbleStat,
	// 	'Private Dash': models.PrivateDash
	// }, 
	// geo = ['Coffee Near Me', 'Places Near Me', 'Food Near Me'],
	// pubMap = {
	// 	'BeHance Project Search': 'behance',
	// 	'Places Near Me': 'places'
	// };
	
	var create = function (req, res, next) {
		
		if (!req.params.uuid || !req.params.id)
			return res.send(400);

		models.Dash.findOne(req.params.id, function(error, dash){
			
			if (error) {
				console.log(error)
				return res.send(500);
				throw error
			};

			if (!dash) return res.send(400);

			var selected = '';			

			if (dash.settingType == 'radio')
				selected = dash.settings[0];
			else if (dash.settingType == 'text') {
				selected = dash.settings;
				
			}

			models.UserDash.create({
				_id: models.objectId(),
				dash_id: dash._id,
				dashType: dash.dashType,
				location: {
					lat: req.params.lat,
					lon: req.params.lon
				},
				user: req.params.uuid,
				title: dash.title,
				subTitle: dash.subTitle,
				description: dash.description,
				credits: dash.credits,
				iconLarge: dash.iconLarge,
				iconSmall: dash.iconSmall,
				settings: dash.settings,
				selectedSetting: selected,
				settingType: dash.settingType
			}, function(error, dash){
				if (error) {
					console.log(error)
					return res.send(500);
					throw error;
				};
				return res.send(dash);
			});
			
		});

	};

	var remove = function (req, res, next) {
		if (!req.params.id)
			return res.send(400);
		models.UserDash.findOne({ _id: req.params.id }, function (error, userDash){

			if (error) {
				return res.send(500);
				throw error
			};

			if (!userDash) return res.send(400);

			userDash.isActive = false;

			userDash.save(function(error){

				if (error) {
					return res.send(500);
					throw error
				};
				return res.send(200);
			});
		});
	};

	var read = function (req, res, next) {

		console.log('read all dashes request received from ', req.params.id)
		if (!req.params.id)
			return res.send(400);

		var q = { 
			user: req.params.id, 
			isActive: true
		};

		if (req.query) {
			var list = [];

			for (var i in req.query) {
				if (i) {
					list.push(req.query[i]);
				}
			}
			if (list.length > 0) {
				q['_id'] = { 
					$in: list
				}; 
			}
			models.UserDash.find(q, function (error, userDash){

				if (error) {
					res.send(500);
					throw error
				};

				if (!userDash) return res.send(400);


				// console.log('found: 196')
				// console.log(userDash)
				
				return res.send(userDash);
			});
		}

		else 
			models.UserDash.find(q, function (error, userDash){

				if (error) {
					return res.send(500);
					throw error
				};

				if (!userDash) return res.send(400);

				return res.send(userDash);
			});
	};

	var readData = function(req, res, next) {
		
		var col;

		if (map[req.query.t] && !map[req.query.t][req.query.s])
			col = map[req.query.t];

		else if (map[req.query.t] && map[req.query.t][req.query.s])
			col = map[req.query.t][req.query.s];


		else {
			return res.send(400);
		}


		if (!col.find) {
			return res.send(400);
		}

		var skip = parseInt(req.query.skip);
		skip = isNaN(skip) ? 0 : skip;

		if (req.query.t == 'BeHance') {

			col.find( { behanceType: req.query.s } )
			.limit(10)
			.skip(skip)
			.sort({'slideshow.pubDate': -1})
			.exec(function(error, docs){
				if (error) {
					res.send(500);
					throw error
				};

				var s = docs.length > 10 ? 10 : docs.length;

				return res.send({content: docs, skip: skip + s});
			});
		}
		else if (req.query.t == 'Dribbble'){
			
			var sort = {'slideshow.pubDate': -1};
			col.find()
			.skip(skip)
			.limit(10)
			.sort(sort)
			.exec(function(error, docs){
				if (error) {
					res.send(500);
					throw error
				};
				var s = docs.length > 10 ? 10 : docs.length;
				return res.send({content: docs, skip: skip + s});
			});
		}
		else if (req.query.t == 'Dribbble Stats') {
			setTimeout(function(){
				var username = req.query.s;
				username = username ? username : 'm_mozafarian';
				var sort = {'stats.pubDate': -1};
				col.find({username: username})
				.skip(skip)
				.limit(10)
				.sort(sort)
				.exec(function(error, docs){
					if (error) {
						res.send(500);
						throw error
					};
					var s = docs.length;
					return res.send({content: docs, skip: skip + s});
				});
			}, 3000);
		}

		else if (req.query.t == 'Coffee Near Me') {
			var m = {};
			if (req.headers.cookie && cookie.parse(req.headers.cookie))
				console.log(cookie.parse(req.headers.cookie))

			m['longitude'] = parseFloat(cookie.parse(req.headers.cookie).longitude);
			m['latitude'] = parseFloat(cookie.parse(req.headers.cookie).latitude);
			col.find({term: 'cafe'})
			.where('geo.location')
			.near([parseFloat(m.longitude), parseFloat(m.latitude)])
			.maxDistance(500)
			.limit(10)
			.skip(skip)
			.exec(function(error, docs){
				if (error) {
					res.send(500);
					throw error
				};
				var s = docs.length > 10 ? 10 : docs.length;
				return res.send({content: docs, skip: skip + s});
			});
		}

		else if (req.query.t == 'Food Near Me') {
			var m = {};
			if (req.headers.cookie && cookie.parse(req.headers.cookie))
				console.log(cookie.parse(req.headers.cookie))

			m['longitude'] = parseFloat(cookie.parse(req.headers.cookie).longitude);
			m['latitude'] = parseFloat(cookie.parse(req.headers.cookie).latitude);
			col.find({term: 'food'})
			.where('geo.location')
			.near([parseFloat(m.longitude), parseFloat(m.latitude)])
			.maxDistance(500)
			.limit(10)
			.skip(skip)
			.exec(function(error, docs){
				if (error) {
					res.send(500);
					throw error
				};
				var s = docs.length > 10 ? 10 : docs.length;
				return res.send({content: docs, skip: skip + s});
			});
		}

		else if (req.query.t == 'Places Near Me') {
			var m = {};
			if (req.headers.cookie && cookie.parse(req.headers.cookie))
				console.log(cookie.parse(req.headers.cookie))

			m['longitude'] = parseFloat(cookie.parse(req.headers.cookie).longitude);
			m['latitude'] = parseFloat(cookie.parse(req.headers.cookie).latitude);
			col.find({term: req.query.s})
			.where('geo.location')
			.near([parseFloat(m.longitude), parseFloat(m.latitude)])
			.maxDistance(500)
			.limit(10)
			.skip(skip)
			.exec(function(error, docs){
				if (error) {
					res.send(500);
					throw error
				};
				var s = docs.length > 10 ? 10 : docs.length;
				return res.send({content: docs, skip: skip + s});
			});
		}

		else if (req.query.t == 'Private Dash') {
		
			col.findOne({ dash_title: req.query.s })
			.exec(function(error, doc){
				if (error) {
					res.send(500);
					throw error
				};
				
				if (!doc) return res.send(404);

				return res.send(doc.json());
			});
		}

		else {
			var sort = {'news.pubDate': -1};
			col.find()
			.skip(skip)
			.limit(10)
			.sort(sort)
			.exec(function(error, docs){
				if (error) {
					res.send(500);
					throw error
				};
				var s = docs.length > 10 ? 10 : docs.length;
				return res.send({content: docs, skip: skip + s});
			});
		};

	}

	var library = function (req, res, next) {

		console.log('LIBRARY GET /dashes');

		models.Dash.find(function (error, dashes) {

			if (error) {
				res.send(500);
				throw error;
			};
			res.send(dashes);
		})
	};

	var uirOpened = function (req, res, next) {

		models.UserSession.findOne({ _id: req.body.sid }, function(error, doc) {
			if (error) {
				console.log(error);
				return res.send(500);
			}
			doc.clicks.push(req.body);
			doc.save();
			res.send(200);
		});

	};

	return {
		create: create,
		remove: remove,
		read: read,
		readData: readData,
		library: library,
		uirOpened: uirOpened
	}
}