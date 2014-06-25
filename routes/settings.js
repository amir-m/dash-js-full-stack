module.exports = function  (models, publisher) {

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
		
	};

	var update = function (req, res, next) {
		
		// TODO: Update the UserSession...

		if (!req.body.setting_type) return res.send(400);

		if (req.body.setting_type == 'radio') {
			if (!req.body.selected_setting || !req.body.uuid || !req.params.id)
				return res.send(400);

			models.UserDash.findOne({id: req.params.id, user: req.body.uuid}, 
			function(error, dash) {

				if (error) return res.send(500);

				if (!dash) {
					console.log('no dash ', req.params.id)
					return res.send(400);
				}

				dash.selected_setting = req.body.selected_setting;
				dash.selected_source_uri = req.body.selected_source_uri;

				dash.save(function(error){

					if (error) return res.send(500);
					
					var col;

					if (map[dash.title] && !map[dash.title][req.body.selected_setting])
						col = map[dash.title];

					else if (map[dash.title] && map[dash.title][req.body.selected_setting])
						col = map[dash.title][req.body.selected_setting]

					else return res.send(400);

					var sort = {};

					// if (dash.title == 'BeHance') {
					// 	models.Content.find( { collection_name: col } )
					// 	// .sort(sort)
					// 	.limit(10)
					// 	.exec(function(error, docs){
					// 		if (error) {
					// 			res.send(500);
					// 			throw error
					// 		};
					// 		res.send({content: docs, skip: 10});
					// 		// models.users.UserSession.findOne({id: req.body.sid}, function(error, doc){
					// 		// 	if (!error) {
					// 		// 		doc.terms.push({
					// 		//             latitude: req.body.latitude,
					// 		//             longitude: req.body.longitude,
					// 		//             colName: 'Behance',
					// 		//             settings: req.body.selected_setting,
					// 		//             timestamp: req.body.timestamp
					// 		// 		});
					// 		// 		doc.save();
					// 		// 	}
					// 		// });
					// 	});
					// }
					// else {
					// 	models.Content.find()
					// 	// .sort(sort)
					// 	.limit(10)
					// 	.exec(function(error, docs){
					// 		if (error) {
					// 			res.send(500);
					// 			throw error
					// 		};
					// 		res.send({content: docs, skip: 10});
					// 		// models.users.UserSession.findOne({id: req.body.sid}, function(error, doc){
					// 		// 	if (!error) {
					// 		// 		doc.terms.push({
					// 		//             latitude: req.body.latitude,
					// 		//             longitude: req.body.longitude,
					// 		//             content_id: req.body.content_id,
					// 		//             colName: req.body.colName,
					// 		//             settings: req.body.settings,
					// 		//             timestamp: req.body.timestamp
					// 		// 		});
					// 		// 		doc.save();
					// 		// 	}
					// 		// });
					// 	});
					// }

					models.Content.find()
						// .sort(sort)
						.limit(10)
						.exec(function(error, docs){
							if (error) {
								res.send(500);
								throw error
							};
							res.send({content: docs, skip: 10});
							// models.users.UserSession.findOne({id: req.body.sid}, function(error, doc){
							// 	if (!error) {
							// 		doc.terms.push({
							//             latitude: req.body.latitude,
							//             longitude: req.body.longitude,
							//             content_id: req.body.content_id,
							//             colName: req.body.colName,
							//             settings: req.body.settings,
							//             timestamp: req.body.timestamp
							// 		});
							// 		doc.save();
							// 	}
							// });
						});
				});

			});
		}
		else if (req.body.setting_type == 'textInput') {
			
			if (!req.body.uuid || !req.params.id)
				return res.send(400);

			models.UserDash.findOne({id: req.params.id, user: req.body.uuid}, 
			function(error, dash) {

				if (error) return res.send(500);

				if (!dash) return res.send(400);

				if (req.body.title != 'Private Dash') {

					dash.selected_setting = req.body.selected_setting.toLowerCase();

					if (req.body.source_uri_values && req.body.source_uri_values.length > 0)
						dash.source_uri_values = req.body.source_uri_values;

					dash.save(function(error){
						
						if (error) throw error;

						res.send(dash);
											
						// if (req.body.title == 'BeHance') {
							
						// 	models.Content.find({term: { $regex: req.body.textInput, $options: 'i' } })
						// 	.limit(10)
						// 	.skip(skip)
						// 	.sort({'slideshow.pubDate': -1})
						// 	.exec(function(error, docs){
						// 		if (error) {
						// 			res.send(500);
						// 			throw error
						// 		};

						// 		if (docs.length == 0) {
						// 			res.send({
						// 				needCallBack: true,
						// 				callBackInterval: 5000,
						// 				skip: 0
						// 			});	
						// 			publisher.publish(pubMap[req.body.title], + req.body.textInput)
						// 		}
						// 		else res.send({
						// 				content: docs,
						// 				needCallBack: false,
						// 				skip: skip + 10
						// 			});
						// 		models.users.UserSession.findOne({id: req.body.sid}, function(error, doc){
						// 			if (!error) {
						// 				doc.terms.push({
						// 		            latitude: req.body.latitude,
						// 		            longitude: req.body.longitude,
						// 		            content_id: req.body.content_id,
						// 		            colName: req.body.colName,
						// 		            settings: req.body.settings,
						// 		            timestamp: req.body.timestamp
						// 				});
						// 				doc.save();
						// 			}
						// 		});
						// 	});
						// }
						
						// else if (req.body.title == 'Dribbble Stats') {

						// 	publisher.publish('DribbbleStatFetch', req.body.textInput.toLowerCase()); 

						// 	models.Content.find({term: { $regex: req.body.textInput, $options: 'i' } })
						// 	.limit(10)
						// 	.skip(skip)
						// 	.sort({'stats.pubDate': -1})
						// 	.exec(function(error, docs){
						// 		if (error) {
						// 			res.send(500);
						// 			throw error
						// 		};

						// 		if (docs.length == 0) {
						// 			res.send({
						// 				needCallBack: true,
						// 				callBackInterval: 5000,
						// 				skip: 0
						// 			});	
						// 		}
						// 		else res.send({
						// 			content: docs,
						// 			needCallBack: false,
						// 			skip: skip + 10
						// 		});
						// 		models.users.UserSession.findOne({id: req.body.sid}, function(error, doc){
						// 			if (!error) {
						// 				doc.terms.push({
						// 		            latitude: req.body.latitude,
						// 		            longitude: req.body.longitude,
						// 		            content_id: req.body.content_id,
						// 		            colName: req.body.colName,
						// 		            settings: req.body.settings,
						// 		            timestamp: req.body.timestamp
						// 				});
						// 				doc.save();
						// 			}
						// 		});
						// 	});
							
						// }

						// else if (req.body.title == 'Places Near Me') {

						// 	if (req.headers.cookie && cookie.parse(req.headers.cookie)) {
						// 		var lat = parseFloat(cookie.parse(req.headers.cookie)['latitude']);
						// 		var lon = parseFloat(cookie.parse(req.headers.cookie)['longitude']);
						// 		publisher.publish('places', lat+'|'+lon+'|'+req.body.textInput.toLowerCase()); 
						// 	}

						// 	models.Content.find({
						//       term: { $regex: req.body.textInput, $options: 'i' },
						//       'geo.location': { 
						//         $geoWithin : { 
						//           $centerSphere : [ [ lon, lat ], 0.310686 / 3959 ] 
						//         } 
						//       }
						//     })
						// 	.limit(10)
						// 	.skip(skip)
						// 	.exec(function(error, docs){
						// 		if (error) {
						// 			res.send(500);
						// 			throw error
						// 		};

						// 		if (docs.length == 0) {
						// 			res.send({
						// 				needCallBack: true,
						// 				callBackInterval: 5000,
						// 				skip: 0
						// 			});	
						// 		}
						// 		else res.send({
						// 			content: docs,
						// 			needCallBack: false,
						// 			skip: skip + 10
						// 		});
						// 		models.users.UserSession.findOne({id: req.body.sid}, function(error, doc){
						// 			if (!error) {
						// 				doc.terms.push({
						// 		            latitude: req.body.latitude,
						// 		            longitude: req.body.longitude,
						// 		            content_id: req.body.content_id,
						// 		            colName: req.body.colName,
						// 		            settings: req.body.settings,
						// 		            timestamp: req.body.timestamp
						// 				});
						// 				doc.save();
						// 			}
						// 		});
						// 	});
							
						// }
						// else if (req.body.title == 'Private Dash') {

						// 	models.PrivateDash.findOne({ 
						// 		dash_title: req.body.textInput 
						// 	}, function(error, doc){
						// 		if (error) throw error;
						// 		if (!doc) {
						// 			return res.send(404);		
						// 		}

						// 		return res.send(doc.json());
						// 	});
						// 	// TODO: Save to UserSession 
						// 	// models.users.UserSession.findOne({id: req.body.sid}, function(error, doc){
						// 	// 	if (!error) {
						// 	// 		doc.terms.push({
						// 	//             latitude: req.body.latitude,
						// 	//             longitude: req.body.longitude,
						// 	//             content_id: req.body.content_id,
						// 	//             colName: req.body.colName,
						// 	//             settings: req.body.settings,
						// 	//             timestamp: req.body.timestamp
						// 	// 		});
						// 	// 		doc.save();
						// 	// 	}
						// 	// });
						// }

						// else return res.send(400);
					});
				}
				else {
					dash.selected_setting = req.body.textInput;
					models.PrivateDash.findOne({ dash_title: { $regex: dash.selected_setting, $options: 'i' } })
					.exec(function(error, doc){
						if (error) {
							res.send(500);
							throw error
						};
						
						if (!doc) return res.send(404);

						dash.private_dash = doc.json();
						dash.dash_has_been_set = true;

						dash.save(function(error){
							return res.send({ dash: dash, privateDash: doc.json() });
						});
					});
				}
			});
		}

	};

	var read = function (req, res, next) {
		
	};
	
	return {
		create: create,
		update: update,
		read: read
	}
}