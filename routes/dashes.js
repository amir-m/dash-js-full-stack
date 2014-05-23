module.exports = function  (models, publisher) {

	// publisher.send('places:' + 'lat:45.4949025|lon:-73.5654505|term:cafe');

	var cookie = require('cookie');

	var map = {
		'Dribbble': {
			'Everyone': 'EveryoneDribbleShot',
			'Popular': 'PopularDribbleShot',
			'Debut': 'DebutsDribbleShot'
		},
		'News': {
			'Business Insider': 'BusinessInsiderFeed',
			Wired: 'WiredFeed',
			VentureBeat: 'VentureBeatFeed',
			TechCrunch: 'TechCrunchFeed',
			'New York Times': 'NewYorkTimesFeed',
			Mashable: 'MashableFeed',
			'Inc.com': 'IncComFeed',
			Forbes: 'ForbesFeed',
			'Fast Company': 'FastCompanyFeed',
			ESPN: 'ESPNFeed',
			Core77: 'Core77Feed',
			'Design Milk': 'DesignMilkFeed'
		},
		'BeHance': {
			'Featured': 'BehanceFeatured',
			'Most Appreciated': 'BehanceMostAppreciated',
			'Most Recent': 'BehanceMostRecent'
		},
		'Coffee Near Me': 'PlacesSearchResult',
		'Places Near Me': 'PlacesSearchResult',
		'Food Near Me': 'PlacesSearchResult',
		'Dribbble Stats': 'DribbbleStat',
		'Private Dash': models.PrivateDash
	}, 
	geo = ['Coffee Near Me', 'Places Near Me', 'Food Near Me'],
	pubMap = {
		'BeHance Project Search': 'behance',
		'Places Near Me': 'places'
	};
	
	var create = function (req, res, next) {
		
		if (!req.params.uuid || !req.params.id)
			return res.send(400);

		models.Dash.findOne(req.params.id, function(error, dash){
			
			if (error) {
				console.log(error)
				return res.send(500);
				throw error
			};

			console.log(dash);

			if (!dash) return res.send(400);

			var selected = '';			

			if (dash.setting_type == 'radio')
				selected = dash.settings[0];
			else if (dash.setting_type == 'text') {
				selected = dash.settings;
			}

			var ud = new models.UserDash({
				id: models.id(),
				dash_id: dash.id,
				dash_type: dash.dash_type,
				location: {
					lat: req.params.lat,
					lon: req.params.lon
				},
				user: req.params.uuid,
				title: dash.title,
				sub_title: dash.sub_title,
				description: dash.description,
				credits: dash.credits,
				icon_large: dash.icon_large,
				icon_small: dash.icon_small,
				settings: dash.settings,
				selected_setting: selected,
				setting_type: dash.setting_type
			});
			ud.save(function(error){
					if (error) {
						console.log(error)
						res.send(500);
						throw error;
					};

					res.send(ud.json());
					models.User.addDash(req.params.uuid, ud.id);
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
			is_active: true
		};

		if (req.query) {
			var list = [];

			for (var i in req.query) {
				if (i) {
					list.push(req.query[i]);
				}
			}
			if (list.length > 0) {
				q['id'] = { 
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

				console.log(userDash);

				if (!userDash) return res.send(400);


				return res.send(userDash);
			});
	};

	var readData = function(req, res, next) {
		
		var col;

		console.log(req.query.t)
		console.log(req.query.s)
		// return res.send(200);

		if (map[req.query.t] && !map[req.query.t][req.query.s])
			col = map[req.query.t];

		else if (map[req.query.t] && map[req.query.t][req.query.s])
			col = map[req.query.t][req.query.s];


		else {
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
				models.Content.find({
					collection_name: col,
					'user_profile.username': username
				})
				.skip(skip)
				.limit(10)
				.sort(sort)
				.exec(function(error, docs){
					if (error) {
						res.send(500);
						throw error
					};
					var s = docs.length;
					console.log('injaaa');
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
			var sort = {'news.pub_date': -1};
			models.Content.find({
				collection_name: col
			})
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

        models.Session.click(req.body);
        res.send(200);

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