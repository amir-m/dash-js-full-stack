module.exports = function(models, redisClient) {

	var dashes = require('./dashes.json');
	// dribblle, dribbble stats ad behance 
	var default_dashes = ['NTI5NjNiMGYwZWZhNzI1ZTliMDAwMDAx', 'NHI5NjlJwBUkSwQZjUxWJupDAwMDAx', 'NHI5NjJwYzUBMwQ3ZjUxWDliMDAwMDAx'];

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
					settings: dash.settings,
					source_uri: dash.source_uri,
					mapper_key: dash.mapper_key,
					mapper_value: dash.mapper_value,
					mapper_static_key: dash.mapper_static_key,
					mapper_static_value: dash.mapper_static_value,
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
		// models.WaitingListEntry.find()
		// .exec(function(error, wlz) {
			
		// 	if (error) throw error;
			
		// 	for (var i = 0; i < wlz.length; ++i) {
				
		// 		if (wlz[i].uuids.length == 0) {
		// 			wlz[i].platform = 'web'; 
		// 			console.log('web ', wlz[i].email)
		// 		}
		// 		else {
		// 			console.log('iPhone ', wlz[i].email)
		// 			wlz[i].platform = 'iPhone'; 
		// 		}
				
		// 		wlz[i].save();
		// 		// if (wlz[i].added_from == 'iOS' && wlz[i].uuids.indexOf(wlz[i].uuid) == -1) {
		// 		// 	wlz[i].uuids.push(wlz[i].uuid);
		// 		// 	wlz[i].uuid_addaded_at.push(wlz[i].created_at);
		// 		// 	wlz[i].save();
		// 		// }
		// 		// wlz[i].platform = wlz[i].added_from == 'iOS' ? 'iPhone' : wlz[i].added_from; 

		// 		// wlz[i].email = models.decipher(wlz[i].email);
		// 		// wlz[i].save();
		// 	}
		// });
		
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
		
		redisClient.keys('user:*', function(error, users){
			if (error) throw error;
			for (var i = 0; i < users.length; ++i) {
				redisClient.hset(users[i], 'notifications', '0');
			}
		});
	};	

	return {
		createDefaultDashes: createDefaultDashes,
		insertDashesToRedisBackend: insertDashesToRedisBackend,
		getBase64Encoding: getBase64,
		confirmUser: confirmUser,
		deleteAllUsers: deleteAllUsers,
		fixSomething: fixSomething
	};
};

// [{
// 	_id: "NTI5NjJmYzUyMzQ3ZjUxZDliMDAwMDAx",
// 	dashType: "slideshow",
// 	avatar: "",
// 	title: "Dribbble",
// 	description: "Displays Dribbble shots for the Popular, Debut, and Everyone categories",
// 	credits: "Dribbble", 
// 	iconLarge: "https://s3.amazonaws.com/s3.dashbook.co/dash_icons/dribbble_large_icon.png",
// 	iconSmall: "https://s3.amazonaws.com/s3.dashbook.co/dash_icons/dribbble_small_icon.png",
// 	settingType: "radio",
// 	location: "",
// 	settings: ["Popular", "Debut", "Everyone"]
// },
// {
// 	_id: "NTJhOWRmMGYxODNiNTAwMDAwMDAwMDAx",
// 	dashType: "stats",
// 	avatar: "",
// 	title: "Dribbble Stats",
// 	description: "Displays the stats (likes, comments, views) of a player’s dribbble shots",
// 	credits: "Dribbble",
// 	iconLarge: "https://s3.amazonaws.com/s3.dashbook.co/dash_icons/dribbble_stats_large_icon.png",
// 	iconSmall: "https://s3.amazonaws.com/s3.dashbook.co/dash_icons/dribbble_stats_small_icon.png",
// 	settingType : "textInput",
// 	location: "",
// 	settings: "m_mozafarian"
// },
// {
// 	_id: "NTI5NjMyNWY1OGM5YmIzNzliMDAwMDAx",
// 	dashType: "slideshow",
// 	avatar: "",
// 	title: "BeHance",
// 	description: "Displays BeHance projects for the Featured, Most Appreciated, Most Recent",
// 	credits: "BeHance",
// 	iconLarge: "https://s3.amazonaws.com/s3.dashbook.co/dash_icons/behance_large_icon.png",
// 	iconSmall: "https://s3.amazonaws.com/s3.dashbook.co/dash_icons/behance_small_icon.png",
// 	settingType : "radio",
// 	location: "",
// 	settings: ["Featured", "Most Appreciated", "Most Recent"]
// },
// {
// 	_id: "NTI5NjM2YmZiMTcxMzg0NTliMDAwMDAx",
// 	title: "News",
// 	dashType: "text",
// 	avatar: "",
// 	description: "Displays the headlines for a variety of new publications",
// 	credits: "Dashbook",
// 	iconLarge: "https://s3.amazonaws.com/s3.dashbook.co/dash_icons/news_large_icon.png",
// 	iconSmall: "https://s3.amazonaws.com/s3.dashbook.co/dash_icons/news_small_icon.png",
// 	settingType: "radio",
// 	location: "",
// 	settings: ["TechCrunch", "ESPN", "New York Times", "Mashable", "Wired", "Inc.com", "Fast Company", "Forbes", "Core77", "Design Milk", "Business Insider"]
// },
// {
// 	_id: "NTI5NjM4NTg2NGZmOGU0YzliMDAwMDAx",
// 	title: "Sidebar.io",
// 	dashType: "text",
// 	settingType: "text",
// 	avatar: "",
// 	description: "Displays the daily, designer-centric articles from Sidebar.io",
// 	credits: "Sidebar.io",
// 	iconLarge: "https://s3.amazonaws.com/s3.dashbook.co/dash_icons/sidebar_io_large_icon.png",
// 	iconSmall: "https://s3.amazonaws.com/s3.dashbook.co/dash_icons/sidebar_io_small_icon.png",
// 	location: "",
// 	settings: "Latest News"
// },
// {
// 	_id: "NTI5NjM5ZTlmOGZjY2Q1ODliMDAwMDAx",
// 	title: "Coffee Near Me",
// 	settingType: "text",
// 	dashType: "geo",
// 	description: "Find the closest cup of coffee based on your current location",
// 	credits: "Google Places",
// 	iconLarge: "https://s3.amazonaws.com/s3.dashbook.co/dash_icons/coffee_large_icon.png",
// 	iconSmall: "https://s3.amazonaws.com/s3.dashbook.co/dash_icons/coffee_small_icon.png",
// 	location: {},
// 	settings: {}
// },
// {
// 	"id": "NTI5NjM2YmZiMTcxMzg0NTliMDAwMDAx",
// 	"title": "News",
// 	"content_type": "text",
// 	"description": "Displays the headlines for a variety of new publications",
// 	"credits": "Dashbook",
// 	"icon_large": "https://s3.amazonaws.com/s3.dashbook.co/dash_icons/news_large_icon.png",
// 	"icon_small": "https://s3.amazonaws.com/s3.dashbook.co/dash_icons/news_small_icon.png",
// 	"setting_type": "radio",
// 	"location": "",
// 	"settings": "TechCrunch:ESPN:New York Times:Mashable:Wired:Inc.com:Fast Company:Forbes:Core77:Design Milk:Business Insider"
// },
// {_id: "NTI5NjNhNjFmNTliN2Y1YzliMDAwMDAx",title: "Places Near Me",dashType: "geo",description: "Find places based on your current location and a search term",credits: "Google Places",iconLarge: "https://s3.amazonaws.com/s3.dashbook.co/dash_icons/places_near_me_large_icon.png",iconSmall: "https://s3.amazonaws.com/s3.dashbook.co/dash_icons/places_near_me_small_icon.png",settingType : "textInput",location: "",settings: ""
// },{_id: "NTI5NjNiMGYwZWZhNzI1ZTliMDAwMDAx",title: "Food Near Me",dashType: "geo",settingType: "text",description: "Find the closest restaurants based on your current location",credits: "Google Places",iconLarge: "https://s3.amazonaws.com/s3.dashbook.co/dash_icons/food_near_me_large_icon.png",iconSmall: "https://s3.amazonaws.com/s3.dashbook.co/dash_icons/food_near_me_small_icon.png",location: "",settings: {}}]