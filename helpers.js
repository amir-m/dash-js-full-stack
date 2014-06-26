module.exports = function(models, redisClient) {

	var dashes = require('./dashes.json');
	// dribblle, dribbble stats ad behance 
	var default_dashes = ['NTI5NjM5ZTlmOGZjY2Q1ODliMDAwMDAx', 'NHI5NjlJwBUkSwQZjUxWJupDAwMDAx', 'NHI5NjJwYzUBMwQ3ZjUxWDliMDAwMDAx'];

	function insertDashesToRedisBackend() {
		redisClient.keys('dash:*', function(error, _dashes){
			if (error) throw error;
			for (var i = 0; i < _dashes.length; ++i) {
				redisClient.del(_dashes[i]);
			}
			for (var i = 0; i < dashes.length; ++i) {
				redisClient.hmset("dash:"+dashes[i].id, dashes[i]);
			}
			// redisClient.keys('user:*', function(error, _users){
			// 	if (error) throw error;
			// 	for (var i = 0; i < _users.length; ++i) {
			// 		console.log(_users[i])
			// 		redisClient.hmset("user:"+_users[i], 'dashes', '');
			// 	}
			// });
		});
	};

	function createDefaultDashes(uuid) {
		console.log('about to create default dashes for ', uuid);
		for (var i = 0; i < default_dashes.length; ++i) {
			models.Dash.findOne(default_dashes[i], function(error, dash){
				var selected = '';			

				if (dash.setting_type == 'radio') {
					selected = dash.settings[0];
				}
				else if (dash.setting_type == 'textInput') {
					selected = dash.settings;
				}

				var ud = new models.UserDash({
					id: models.id(),
					dash_id: dash.id,
					user: uuid,
					title: dash.title,
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
					selected_source_uri: (dash.source_uri && dash.source_uri[0]) ? dash.source_uri[0] : '', 
					handler_placeholder: dash.handler_placeholder,
					data_container: dash.data_container,
					source_return_type: dash.source_return_type || 'json',
					settings: dash.settings,
					source_uri: dash.source_uri,
					mapper_key: dash.mapper_key,
					mapper_value: dash.mapper_value,
					mapper_static_key: dash.mapper_static_key,
					mapper_static_value: dash.mapper_static_value,
					components_settings: dash.components_settings || '',
					collection_name: dash.collection_name,
					has_settings: dash.has_settings
				});
				ud.save(function(error){
					if (error) {
						console.log(error)
						res.send(500);
						throw error;
					};
					models.User.addDash(uuid, ud.id);
				});

			});
		}
	};

	function getBase64(base) {
		return (new Buffer(base).toString('base64'));
	};

	function confirmUser(email, uuid, from, callback) {
		
		// email = models.cipher(email);

		// models.WaitingListEntry.findOne({ email: email }, function(error, wle){
			
		// 	if (error && callback) return callback(error);
			
		// 	if (!wle) {
		// 		return callback(404);
		// 		models.User.register({
		// 			uuid: req.body.uuid,
		// 			email: req.body.email
		// 		}, function(error, status, count, conflict){
		// 			if ((error && error == 409) || conflict) res.send({ error: 409, count: count });
		// 			else if (error) return res.send(error);
		// 			else res.json({ status: status, count: count });
		// 		});
		// 	}


		// 	wle.confirmed = true;
		// 	wle.confirmed_by = from;
		// 	wle.confirmed_at = new Date().getTime();
		// 	wle.status = 3;
		// 	wle.save();
		// 	redisClient.hset('user:'+wle.uuid, 'status', 3);
		// 	if (callback) callback(null);
		// });
	};

	function deleteAllUsers(){
		redisClient.keys('user:*', function(error, users){
			if (error) throw error;
			for (var i = 0; i < users.length; ++i)
				redisClient.del(users[i]);
		});
	};

	function fixSomething() {
		// $or: [{ status: 3 }, { status: '3' }], app_launched: true
		models.WaitingListEntry.find({ $or: [{ status: 3 }, { status: '3' }], app_launched: true })
		.exec(function(error, wlz) {
			
			if (error) throw error;
			
			for (var i = 0; i < wlz.length; ++i) {
				
				for (var j = 0; j < wlz[i].uuids.length; ++j) {
					redisClient.hset('user:'+wlz[i].uuids[j], 'dashes', '');
					createDefaultDashes(wlz[i].uuids[j]);
				}

				// if (wlz[i].uuid_addaded_at && wlz[i].uuid_addaded_at.length > 0 ) {
				// 	console.log('uuid_addaded_at: ', wlz[i].uuid_addaded_at);
				// 	console.log('uuid_added_at: ', wlz[i].uuid_added_at);
				// 	if (wlz[i].uuid_added_at.indexOf(wlz[i].uuid_addaded_at[0]) == -1) 
				// 		wlz[i].uuid_added_at.push(wlz[i].uuid_addaded_at[0]);
				// 	wlz[i].save();
				// }
			}
		});
		
		// redisClient.keys('user:*', function(error, users){
		// 	if (error) throw error;
		// 	for (var i = 0; i < users.length; ++i) {
		// 		redisClient.hgetall(users[i], function(error, user){
		// 			if (error) throw error;
		// 			// if (!user.platform) {
		// 			// 	redisClient.hset('user:'+user.uuid, 'platform', 'iPhone');
		// 			// }
					
		// 			console.log(user.platform);
		// 		});
		// 	}
		// });
		
		// redisClient.keys('user:*', function(error, users){
		// 	if (error) throw error;
		// 	for (var i = 0; i < users.length; ++i) {
		// 		redisClient.hset(users[i], 'notifications', '0');
		// 	}
		// });
	};	

	function insertDashesToMongoBackend () {
		models.Dash.remove({}, { multi: true }, function (error) {
			if (error) throw error;
			models.Dash.insert(dashes, function (error) {
				if (error) throw error;
				console.log('dashes are now created! check em on mongo');
			});
		});
	};

	return {
		createDefaultDashes: createDefaultDashes,
		insertDashesToRedisBackend: insertDashesToRedisBackend,
		getBase64Encoding: getBase64,
		confirmUser: confirmUser,
		deleteAllUsers: deleteAllUsers,
		fixSomething: fixSomething,
		insertDashesToMongoBackend: insertDashesToMongoBackend
	};
};

// [{
// 	"id": "NTI5NjJmYzUyNzQ3ZjUxADLiQDBzMDAy",
// 	"content_type": "privateDash",
// 	"dash_type": "privateDash",
// 	"title": "Private Dash",
// 	"description": "This is a private dash.",
// 	"credits": "Dashbench", 
// 	"icon_large": "https://s3.amazonaws.com/s3.dashbook.co/dash_icons/default_large_icon.png",
// 	"icon_small": "https://s3.amazonaws.com/s3.dashbook.co/dash_icons/default_small_icon.png",
// 	"setting_type": "textInput",
// 	"location": "",
// 	"settings": "",
// 	"has_settings": "true",
// 	"dash_has_been_set": "false"
// },
// {
// 	"id": "NTI5NjJmYzUyMzQ3ZjUxZDliMDAwMDAx",	
// 	"source_uri": "https://api.dribbble.com/shots/popular?per_page=10|^._.^|https://api.dribbble.com/shots/debuts?per_page=10|^._.^|https://api.dribbble.com/shots/everyone?per_page=10",
// 	"source_return_type": "json",
// 	"content_type": "src_comp:hero_comp:desc_comp:footer_comp",
// 	"title": "Dribbble",
// 	"description": "Displays Dribbble shots for the Popular, Debut, and Everyone categories",
// 	"credits": "Dribbble", 
// 	"icon_large": "https://s3.amazonaws.com/s3.dashbook.co/dash_icons/dribbble_large_icon.png",
// 	"icon_small": "https://s3.amazonaws.com/s3.dashbook.co/dash_icons/dribbble_small_icon.png",
// 	"setting_type": "radio",
// 	"location": "",
// 	"settings": "Popular:Debut:Everyone",
// 	"data_container": "shots",
// 	"mapper_key": "src_comp.resource_uri:desc_comp.header:desc_comp.text:desc_comp.avatar_img:hero_comp.main_img:footer_comp.time",
// 	"mapper_value": "url:player.name:title:player.avatar_url:image_url:created_at",
// 	"has_settings": "true"
// },
// {
// 	"id": "NHI5NjJwYzUBMwQ3ZjUxWDliMDAwMDAx",
// 	"source_uri": "http://engine-env.elasticbeanstalk.com/fifa",
// 	"source_return_type": "json",
// 	"content_type": "src_comp:sports_comp",
// 	"title": "World Cup Brazil",
// 	"description": "Displays World Cup matches and live scores.",
// 	"credits": "FIFA", 
// 	"icon_large": "https://s3.amazonaws.com/s3.dashbook.co/dash_icons/worldcup_large_icon.png",
// 	"icon_small": "https://s3.amazonaws.com/s3.dashbook.co/dash_icons/worldcup_small_icon.png",
// 	"setting_type": "",
// 	"location": "",
// 	"settings": "",
// 	"data_container": "data",
// 	"mapper_key": "src_comp.resource_uri:sports_comp.home_team_flag:sports_comp.home_team:sports_comp.score:sports_comp.status:sports_comp.away_team_flag:sports_comp.away_team",
// 	"mapper_value": "resource_uri:home_team_flag:home_team:score:date:away_team_flag:away_team",
// 	"has_settings": "false"
// },
// {
// 	"id": "NHI5NjlJwBUkSwQZjUxWJupDAwMDAx",
// 	"source_uri": "http://engine-env.elasticbeanstalk.com/fifa/news",
// 	"source_return_type": "json",
// 	"content_type": "src_comp:hero_comp:desc_comp:footer_comp",
// 	"title": "World Cup News",
// 	"description": "Displays World Cup latest news.",
// 	"credits": "FIFA", 
// 	"icon_large": "https://s3.amazonaws.com/s3.dashbook.co/dash_icons/worldcup_news_large_icon.png",
// 	"icon_small": "https://s3.amazonaws.com/s3.dashbook.co/dash_icons/worldcup_news_small_icon.png",
// 	"setting_type": "",
// 	"location": "",
// 	"settings": "",
// 	"data_container": "data",
// 	"mapper_key": "src_comp.resource_uri:hero_comp.main_img:desc_comp.header:desc_comp.text:footer_comp.footer",
// 	"mapper_value": "resource_uri:main_img:title:text:date",
// 	"has_settings": "false"
// },
// {
// 	"id": "NTJhOWRmMGYxODNiNTAwMDAwMDAwMDAx",
// 	"content_type": "src_comp:hero_comp:desc_comp:footer_comp",
// 	"title": "Dribbble Stats",
// 	"source_uri": "https://api.dribbble.com/players/{id}/shots?page={page}&per_page=10",
// 	"source_return_type": "json",
// 	"source_uri_scheme": "https://api.dribbble.com/players/{id}/shots?page={page}&per_page=10",
// 	"source_uri_keys": "{id}:{page}",
// 	"source_uri_values": "m_mozafarian:1",
// 	"selected_setting_uri_field": "{id}",
// 	"description": "Displays the stats (likes, comments, views) of a player’s dribbble shots",
// 	"credits": "Dribbble",
// 	"icon_large": "https://s3.amazonaws.com/s3.dashbook.co/dash_icons/dribbble_stats_large_icon.png",
// 	"icon_small": "https://s3.amazonaws.com/s3.dashbook.co/dash_icons/dribbble_stats_small_icon.png",
// 	"setting_type": "textInput",
// 	"location": "",
// 	"settings": "m_mozafarian",
// 	"data_container": "shots",
// 	"mapper_key": "src_comp.resource_uri:hero_comp.main_img:hero_comp.stat1:hero_comp.stat2:hero_comp.stat3:desc_comp.header:desc_comp.text:desc_comp.avatar_img:hero_comp.main_img:footer_comp.time",
// 	"mapper_value": "url:image_url:views_count:likes_count:comments_count:player.name:title:player.avatar_url:image_url:created_at",
// 	"mapper_static_key": "hero_comp.label1:hero_comp.label2:hero_comp.label3",
// 	"mapper_static_value": "Views:Likes:Comments",
// 	"has_settings": "true"
// },
// {
// 	"id": "MTY7KiQnZxLQMzQ3ZjUxZDliMDAwMDAx",	
// 	"source_uri": "https://api.instagram.com/v1/media/search?lat={latitude}&lng={longitude}&distance=5000&client_id={client_id}",
// 	"source_uri_keys": "{latitude}:{longitude}:{client_id}",
// 	"source_uri_values": "latitude:longitude:279a55cf0c324a83b90d36c29bf503ff",
// 	"source_return_type": "json",
// 	"content_type": "src_comp:hero_comp:desc_comp",
// 	"title": "Photos Around Me",
// 	"description": "Displays latest photos taken near your current location.",
// 	"credits": "Instagram", 
// 	"icon_large": "https://s3.amazonaws.com/s3.dashbook.co/dash_icons/photos_around_me_large_icon.png",
// 	"icon_small": "https://s3.amazonaws.com/s3.dashbook.co/dash_icons/photos_around_me_small_icon.png",
// 	"setting_type": "",
// 	"location": "",
// 	"settings": "",
// 	"data_container": "data",
// 	"mapper_key": "src_comp.resource_uri:desc_comp.header:desc_comp.avatar_img:hero_comp.main_img",
// 	"mapper_value": "link:user.full_name:user.profile_picture:images.standard_resolution.url",
// 	"has_settings": "false"
// },
// {
// 	"id": "NTI5NjNhNjFmNTliN2Y1YzliMDAwMDAx",
// 	"title": "Places Near Me",
// 	"source_uri": "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location={latitude},{longitude}&rankBy=distance&radius=4000&keyword={keyword}&sensor=true&key={api_key}",
// 	"source_return_type": "json",
// 	"source_uri_scheme": "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location={latitude},{longitude}&rankBy=distance&radius=4000&keyword={keyword}&sensor=true&key={api_key}",
// 	"source_uri_keys": "{latitude}:{longitude}:{keyword}:{api_key}",
// 	"source_uri_values": "latitude:longitude:Notman House:AIzaSyAfzGESbROgOjoOqJrMbtIKNRtebL3w0Lc",
// 	"selected_setting_uri_field": "{keyword}",
// 	"content_type": "src_comp:geo_comp",
// 	"description": "Find places based on your current location and a search term",
// 	"credits": "Google Places",
// 	"icon_large": "https://s3.amazonaws.com/s3.dashbook.co/dash_icons/places_near_me_large_icon.png",
// 	"icon_small": "https://s3.amazonaws.com/s3.dashbook.co/dash_icons/places_near_me_small_icon.png",
// 	"settings": "Notman House",
// 	"setting_type" : "textInput",
// 	"data_container": "results",
// 	"mapper_key": "geo_comp.header:geo_comp.text:geo_comp.latitude:geo_comp.longitude",
// 	"mapper_value": "name:vicinity:geometry.location.lat:geometry.location.lng",
// 	"has_settings": "true"
// },
// {
// 	"id": "NTI5NjM5ZTlmOGZjY2Q1ODliMDAwMDAx",
// 	"title": "Coffee Near Me",
// 	"source_return_type": "json",
// 	"source_uri": "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location={latitude},{longitude}&rankBy=distance&radius=4000&keyword={keyword}&sensor=true&key={api_key}",
// 	"source_uri_keys": "{latitude}:{longitude}:{keyword}:{api_key}",
// 	"source_uri_values": "latitude:longitude:coffee:AIzaSyAfzGESbROgOjoOqJrMbtIKNRtebL3w0Lc",
// 	"content_type": "src_comp:geo_comp",
// 	"setting_type": "n/a",
// 	"description": "Find the closest cup of coffee based on your current location",
// 	"credits": "Google Places",
// 	"icon_large": "https://s3.amazonaws.com/s3.dashbook.co/dash_icons/coffee_large_icon.png",
// 	"icon_small": "https://s3.amazonaws.com/s3.dashbook.co/dash_icons/coffee_small_icon.png",
// 	"settings": "coffee",
// 	"data_container": "results",
// 	"mapper_key": "geo_comp.header:geo_comp.text:geo_comp.latitude:geo_comp.longitude",
// 	"mapper_value": "name:vicinity:geometry.location.lat:geometry.location.lng",
// 	"has_settings": "false"
// },
// {
// 	"id": "NTI5NjNiMGYwZWZhNzI1ZTliMDAwMDAx",
// 	"title": "Food Near Me",
// 	"source_uri": "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location={latitude},{longitude}&rankBy=distance&radius=4000&keyword={keyword}&sensor=true&key={api_key}",
// 	"source_return_type": "json",
// 	"source_uri_keys": "{latitude}:{longitude}:{keyword}:{api_key}",
// 	"source_uri_values": "latitude:longitude:food:AIzaSyAfzGESbROgOjoOqJrMbtIKNRtebL3w0Lc",
// 	"content_type": "src_comp:geo_comp",
// 	"settings": "food",
// 	"setting_type": "n/a",
// 	"description": "Find the closest restaurants based on your current location",
// 	"credits": "Google Places",
// 	"icon_large": "https://s3.amazonaws.com/s3.dashbook.co/dash_icons/food_near_me_large_icon.png",
// 	"icon_small": "https://s3.amazonaws.com/s3.dashbook.co/dash_icons/food_near_me_small_icon.png",
// 	"location": "",
// 	"data_container": "results",
// 	"mapper_key": "geo_comp.header:geo_comp.text:geo_comp.latitude:geo_comp.longitude",
// 	"mapper_value": "name:vicinity:geometry.location.lat:geometry.location.lng",
// 	"has_settings": "false"
// }]
