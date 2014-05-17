module.exports = function  (models, publisher) {

	var cookie = require('cookie');

	var map = {
		'Dribbble': {
			'Everyone': models.dashes.EveryoneDribbleShot,
			'Popular': models.dashes.PopularDribbleShot,
			'Debut': models.dashes.DebutsDribbleShot
		},
		'News': {
			'Business Insider': models.dashes.BusinessInsider,
			Wired: models.dashes.Wired,
			VentureBeat: models.dashes.VentureBeat,
			TechCrunch: models.dashes.TechCrunch,
			'New York Times': models.dashes.NewYorkTimes,
			Mashable: models.dashes.Mashable,
			'Inc.com': models.dashes.IncCom,
			Forbes: models.dashes.Forbes,
			'Fast Company': models.dashes.FastCompany,
			ESPN: models.dashes.ESPN,
			Core77: models.dashes.Core77,
			'Design Milk': models.dashes.DesignMilk
		},
		'BeHance': models.dashes.Behance,
		'Coffee Near Me': models.dashes.PlacesSearchResult,
		'Places Near Me': models.dashes.PlacesSearchResult,
		'Food Near Me': models.dashes.PlacesSearchResult,
		'Sidebar.io': models.dashes.SideBarIO,
		'Dribbble Stats': models.dashes.DribbbleStat,
		'Private Dash': models.dashes.PrivateDash
	},
	pubMap = {
		'BeHance': 'behance',
		'Places Near Me': 'places'
	};

	var create = function (req, res, next) {
		
	};

	var update = function (req, res, next) {

		if (!req.body.settingType) return res.send(400);

		if (req.body.settingType == 'radio') {
			if (!req.body.selectedSetting || !req.body.uuid || !req.params.id)
				return res.send(400);

			models.dashes.UserDash.findOne({_id: req.params.id, user: req.body.uuid}, 
			function(error, dash) {

				if (error) return res.send(500);

				if (!dash) {
					console.log('no dash ', req.params.id)
					return res.send(400);
				}

				dash.selectedSetting = req.body.selectedSetting;

				dash.save(function(error){

					if (error) return res.send(500);
					
					var col;

					if (map[dash.title] && !map[dash.title][req.body.selectedSetting])
						col = map[dash.title];

					else if (map[dash.title] && map[dash.title][req.body.selectedSetting])
						col = map[dash.title][req.body.selectedSetting]

					else return res.send(400);

					if (!col.find) return res.send(400);

					var sort = {};
					
					if (dash.dashType == 'slideshow')
						sort['slideshow.pubDate'] = -1;

					else if (dash.dashType == 'text')
						sort['news.pubDate'] = -1;

					if (dash.title == 'BeHance') {
						col.find( { behanceType: req.body.selectedSetting } )
						.sort(sort)
						.limit(10)
						.exec(function(error, docs){
							if (error) {
								res.send(500);
								throw error
							};
							res.send({content: docs, skip: 10});
							models.users.UserSession.findOne({_id: req.body.sid}, function(error, doc){
								if (!error) {
									doc.terms.push({
							            latitude: req.body.latitude,
							            longitude: req.body.longitude,
							            colName: 'Behance',
							            settings: req.body.selectedSetting,
							            timestamp: req.body.timestamp
									});
									doc.save();
								}
							});
						});
					}
					else {
						col.find()
						.sort(sort)
						.limit(10)
						.exec(function(error, docs){
							if (error) {
								res.send(500);
								throw error
							};
							res.send({content: docs, skip: 10});
							models.users.UserSession.findOne({_id: req.body.sid}, function(error, doc){
								if (!error) {
									doc.terms.push({
							            latitude: req.body.latitude,
							            longitude: req.body.longitude,
							            content_id: req.body.content_id,
							            colName: req.body.colName,
							            settings: req.body.settings,
							            timestamp: req.body.timestamp
									});
									doc.save();
								}
							});
						});
					}
				});

			});
		}
		else if (req.body.settingType == 'textInput') {
			
			if (!req.body.textInput || !req.body.uuid || !req.params.id)
				return res.send(400);

			models.dashes.UserDash.findOne({_id: req.params.id, user: req.body.uuid}, 
			function(error, dash) {

				if (error) return res.send(500);

				if (!dash) return res.send(400);

				if (req.body.title != 'Private Dash')
					dash.selectedSetting = req.body.textInput.toLowerCase();
				else dash.selectedSetting = req.body.textInput;

				dash.save(function(error){
					
					if (error) return res.send(500);

					var col = map[dash.title], skip = req.body.skip || 0;

					skip = parseInt(skip);
					
					if (req.body.title == 'BeHance') {
						
						col.find({term: { $regex: req.body.textInput, $options: 'i' } })
						.limit(10)
						.skip(skip)
						.sort({'slideshow.pubDate': -1})
						.exec(function(error, docs){
							if (error) {
								res.send(500);
								throw error
							};

							if (docs.length == 0) {
								res.send({
									needCallBack: true,
									callBackInterval: 5000,
									skip: 0
								});	
								publisher.publish(pubMap[req.body.title], + req.body.textInput)
							}
							else res.send({
									content: docs,
									needCallBack: false,
									skip: skip + 10
								});
							models.users.UserSession.findOne({_id: req.body.sid}, function(error, doc){
								if (!error) {
									doc.terms.push({
							            latitude: req.body.latitude,
							            longitude: req.body.longitude,
							            content_id: req.body.content_id,
							            colName: req.body.colName,
							            settings: req.body.settings,
							            timestamp: req.body.timestamp
									});
									doc.save();
								}
							});
						});
					}
					
					else if (req.body.title == 'Dribbble Stats') {

						publisher.publish('DribbbleStatFetch', req.body.textInput.toLowerCase()); 

						col.find({term: { $regex: req.body.textInput, $options: 'i' } })
						.limit(10)
						.skip(skip)
						.sort({'stats.pubDate': -1})
						.exec(function(error, docs){
							if (error) {
								res.send(500);
								throw error
							};

							if (docs.length == 0) {
								res.send({
									needCallBack: true,
									callBackInterval: 5000,
									skip: 0
								});	
							}
							else res.send({
								content: docs,
								needCallBack: false,
								skip: skip + 10
							});
							models.users.UserSession.findOne({_id: req.body.sid}, function(error, doc){
								if (!error) {
									doc.terms.push({
							            latitude: req.body.latitude,
							            longitude: req.body.longitude,
							            content_id: req.body.content_id,
							            colName: req.body.colName,
							            settings: req.body.settings,
							            timestamp: req.body.timestamp
									});
									doc.save();
								}
							});
						});
						
					}

					else if (req.body.title == 'Places Near Me') {

						if (req.headers.cookie && cookie.parse(req.headers.cookie)) {
							var lat = parseFloat(cookie.parse(req.headers.cookie)['latitude']);
							var lon = parseFloat(cookie.parse(req.headers.cookie)['longitude']);
							publisher.publish('places', lat+'|'+lon+'|'+req.body.textInput.toLowerCase()); 
						}

						col.find({
					      term: { $regex: req.body.textInput, $options: 'i' },
					      'geo.location': { 
					        $geoWithin : { 
					          $centerSphere : [ [ lon, lat ], 0.310686 / 3959 ] 
					        } 
					      }
					    })
						.limit(10)
						.skip(skip)
						.exec(function(error, docs){
							if (error) {
								res.send(500);
								throw error
							};

							if (docs.length == 0) {
								res.send({
									needCallBack: true,
									callBackInterval: 5000,
									skip: 0
								});	
							}
							else res.send({
								content: docs,
								needCallBack: false,
								skip: skip + 10
							});
							models.users.UserSession.findOne({_id: req.body.sid}, function(error, doc){
								if (!error) {
									doc.terms.push({
							            latitude: req.body.latitude,
							            longitude: req.body.longitude,
							            content_id: req.body.content_id,
							            colName: req.body.colName,
							            settings: req.body.settings,
							            timestamp: req.body.timestamp
									});
									doc.save();
								}
							});
						});
						
					}
					else if (req.body.title == 'Private Dash') {

						models.dashes.PrivateDash.findOne({ 
							dash_title: req.body.textInput 
						}, function(error, doc){
							if (error) throw error;
							if (!doc) {
								return res.send(404);		
							}

							return res.send(doc.json());
						});
						// TODO: Save to UserSession 
						// models.users.UserSession.findOne({_id: req.body.sid}, function(error, doc){
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
					}

					else return res.send(400);

				});

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