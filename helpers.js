module.exports = function(models, redisClient) {

	var dashes = require('./dashes.json');
	// dribblle, dribbble stats ad behance 
	var defaultDashes = ['NTI5NjJmYzUyMzQ3ZjUxZDliMDAwMDAx', 'NTJhOWRmMGYxODNiNTAwMDAwMDAwMDAx', 'NTI5NjMyNWY1OGM5YmIzNzliMDAwMDAx']

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
		models.Dash.find({ _id: { $in: defaultDashes} }, 
		function(error, dashes){
			
			if (error) {
				console.log(error)
				return res.send(500);
				throw error
			};


			for (var i = 0; i < dashes.length; ++i) {
				var selected = '';			

				if (dashes[i].settingType == 'radio')
					selected = dashes[i].settings[0];
				else if (dashes[i].settingType == 'text' || dashes[i].settingType == 'textInput') {
					selected = dashes[i].settings;	
				}

				models.dashes.UserDash.create({
					_id: models.dashes.objectId(),
					dash_id: dashes[i]._id,
					dashType: dashes[i].dashType,
					user: uuid,
					title: dashes[i].title,
					subTitle: dashes[i].subTitle,
					description: dashes[i].description,
					credits: dashes[i].credits,
					iconLarge: dashes[i].iconLarge,
					iconSmall: dashes[i].iconSmall,
					settings: dashes[i].settings,
					selectedSetting: selected,
					settingType: dashes[i].settingType
				}, function(error){
					if (error) {
						console.log(error)
					}
					else console.log('default dash created for user %s', uuid);
				});
				
			}
			
		});
	};

	function getBase64(base) {
		return (new Buffer(base).toString('base64'));
	};

	function confirmUser(email, from, callback) {
		
		email = models.cipher(email);
		
		models.WaitingListEntry.findOne({ email: email }, function(error, wle){
			
			if (error && callback) return callback(error);
			
			if (!wle) return callback(404);

			wle.confirmed = true;
			wle.confirmed_by = from;
			wle.confirmed_at = new Date().getTime();
			wle.status = 3;
			wle.save();
			redisClient.hset('user:'+wle.uuid, 'status', 3);
			if (callback) callback(null);
		});
	};

	function deleteAllUsers(){
		redisClient.keys('user:*', function(error, users){
			if (error) throw error;
			for (var i = 0; i < users.length; ++i)
				redisClient.del(users[i]);
		});
	};

	function fixSomething() {
		models.WaitingListEntry.find()
		.exec(function(error, wlz) {
			
			if (error) throw error;
			
			for (var i = 0; i < wlz.length; ++i) {
				
				if (wlz[i].uuids.length == 0) {
					wlz[i].platform = 'web'; 
					console.log('web ', wlz[i].email)
				}
				else {
					console.log('iPhone ', wlz[i].email)
					wlz[i].platform = 'iPhone'; 
				}
				
				wlz[i].save();
				// if (wlz[i].added_from == 'iOS' && wlz[i].uuids.indexOf(wlz[i].uuid) == -1) {
				// 	wlz[i].uuids.push(wlz[i].uuid);
				// 	wlz[i].uuid_addaded_at.push(wlz[i].created_at);
				// 	wlz[i].save();
				// }
				// wlz[i].platform = wlz[i].added_from == 'iOS' ? 'iPhone' : wlz[i].added_from; 

				// wlz[i].email = models.decipher(wlz[i].email);
				// wlz[i].save();
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