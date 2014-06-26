stackTraceLimit = Infinity;

module.exports = function  (models, publisher) {

	// publisher.send('places:' + 'lat:45.4949025|lon:-73.5654505|term:cafe');

	var cookie = require('cookie'),
		async = require('async');

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
		
		if (!req.param('uuid') || !req.param('id'))
			return res.send(400);

		models.Dash.findOne({ id: req.param('id') }, function(error, dash){
			
			if (error) {
				console.log(error)
				res.send(500);
				throw error
			};

			if (!dash) return res.send(400);

			var selected = '';			

			if (dash.setting_type == 'radio') {
				selected = dash.settings[0];
			}
			else if (dash.setting_type == 'textInput') {
				selected = dash.settings;
			}
			var user_dash = {
				id: models.id(),
				dash_id: dash.id,
				user: req.param('uuid'),
				title: dash.title,
				location: {
					lat: req.param('lat'),
					lon: req.param('lon')
				},
				description: dash.description,
				credits: dash.credits,
				icon_small: dash.icon_small,
				icon_large: dash.icon_large,
				setting_type: dash.setting_type,
				selected_setting: selected,
				selected_setting_uri_field: dash.selected_setting_uri_field || '',
				source_uri_scheme: dash.source_uri_scheme || '',
				content_type: dash.content_type,
				source_uri_keys: dash.source_uri_keys,
				source_uri_values: dash.source_uri_values,
				selected_source_uri: (dash.source_uri && dash.source_uri[0]) ? dash.source_uri[0] : dash.source_uri, 
				source_return_type: dash.source_return_type,
				handler_placeholder: dash.handler_placeholder,
				data_container: dash.data_container,
				settings: dash.settings,
				source_uri: dash.source_uri,
				mapper_key: dash.mapper_key,
				mapper_value: dash.mapper_value,
				mapper_static_key: dash.mapper_static_key,
				mapper_static_value: dash.mapper_static_value,
				components_settings: dash.components_settings || '',
				collection_name: dash.collection_name,
				has_settings: dash.has_settings
			};

			// if (dash.title == 'Private Dash') {
			// 	user_dash.dash_has_been_set = fa;
			// }

			var ud = new models.UserDash(user_dash);

			ud.save(function(error){
				if (error) {
					console.log(error)
					res.send(500);
					throw error;
				};

				res.send(ud.json());
				models.User.addDash(req.param('uuid'), ud.id);
			});
		});

	};

	var remove = function (req, res, next) {
		
		if (!req.params.id) return res.send(400);

		res.send(200);

		models.User.removeDash(req.params.uuid, req.params.id);

		models.UserDash.findOne({ id: req.params.id }, function (error, userDash){

			if (error) {
				throw error
			};

			if (!userDash) return res.send(400);

			userDash.is_active = false;

			userDash.save(function(error){

				if (error) {
					throw error
				};
			});
		});
	};

	var read = function (req, res, next) {

		if (!req.params.id) return res.send(400);

		async.waterfall([
			function(callback) {
				models.User.findOne(req.params.id, callback);
			},
			function(user, callback) {
				
				if (!user) callback('ERROR: user not found');

				if (!user.dashes || user.dashes.length == 0) {
					user.dashes = [];
					callback(null, [], user);
				}
				else {
					var t = [];
					for (var i = 0; i < user.dashes.length; ++i) {
						t.push({ id: user.dashes[i] });
					}
					// { id: { $in: user.dashes }
					models.UserDash.find({ $or: t }, function (error, userDash){
						if (error) {
							callback(error);
						};

						callback(null, userDash, user);
					});
				}
			}
		], 
		function(error, userDash, user){
			if (error) {
				res.send([]);
				throw error;
			}
			else {
				res.send({
					dashes: userDash,
					user: user
				});
			}
		});


		// var q = { 
		// 	user: req.params.id, 
		// 	is_active: true
		// };

		// if (req.query) {
		// 	var list = [];

		// 	for (var i in req.query) {
		// 		if (i) {
		// 			list.push(req.query[i]);
		// 		}
		// 	}
		// 	if (list.length > 0) {
		// 		q['id'] = { 
		// 			$in: list
		// 		}; 
		// 	}
		// 	models.UserDash.find(q, function (error, userDash){

		// 		if (error) {
		// 			res.send(500);
		// 			throw error
		// 		};

		// 		if (!userDash) return res.send(400);


		// 		// console.log('found: 196')
		// 		// console.log(userDash)
				
		// 		return res.send(userDash);
		// 	});
		// }

		// else 
		// 	models.UserDash.find(q, function (error, userDash){

		// 		if (error) {
		// 			return res.send(500);
		// 			throw error
		// 		};

		// 		console.log(userDash);

		// 		if (!userDash) return res.send(400);


		// 		return res.send(userDash);
		// 	});
	};

	var readData = function(req, res, next) {
		
		var col;

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

		if (req.query.t == 'Dribbble'){
			
			// var sort = {'slideshow.pubDate': -1};
			models.Content.find({ collection_name: col })
			.skip(skip)
			.limit(10)
			// .sort(sort)
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
				// .sort(sort)
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
			// .skip(skip)
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

			console.log(req.query.s);
		
			col.findOne({ dash_title: { $regex: req.query.s, $options: 'i' } })
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
			// var sort = {'news.pub_date': -1};
			models.Content.find({
				collection_name: col
			})
			.skip(skip)
			.limit(10)
			// .sort(sort)
			.exec(function(error, docs){
				if (error) {
					res.send(500);
					throw error
				};
				var s = docs.length > 10 ? 10 : docs.length;
				return res.send({content: docs, skip: skip + s});
			});
		};
	};

	var library = function (req, res, next) {

		models.Dash.find().toArray(function (error, dashes) {

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

	var rearrange = function(req, res, next) {

		if (!req.body.uuid || !req.body.dashes || !req.body.dashes.length) return res.send(400);

		models.User.rearrangeDashes(req.body.uuid, req.body.dashes);
		res.send(200);
	};

	return {
		create: create,
		remove: remove,
		read: read,
		readData: readData,
		library: library,
		uirOpened: uirOpened,
		rearrange: rearrange
	}
}