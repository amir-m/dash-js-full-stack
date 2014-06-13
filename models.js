var self = this,
	mongoose = require('mongoose'),
	crypto = require('crypto'),
	redisClient,
	connectionString = "mongodb://admin:IuT603JamshEqplE2N&0}x!@candidate.19.mongolayer.com:10061/dbk",
	collections = {
		'PopularDribbleShot':  '',
		'EveryoneDribbleShot': '',
		'DebutsDribbleShot': '',
		'BehanceFeatured': '',
		'BehanceMostAppreciated': '',
		'BehanceMostRecent': '',
		'BusinessInsiderFeed': '' ,
		'WiredFeed': '',
		'VentureBeatFeed': '',
		'TechCrunchFeed': '',
		'NewYorkTimesFeed':'',
		'MashableFeed':'',
		'IncComFeed':'',
		'ForbesFeed':'',
		'FastCompanyFeed': '', 
		'ESPNFeed': '', 
		'Core77Feed': '', 
		'DesignMilkFeed': '', 
		'SideBarIOFeed': '',
		'BehanceSearchResult': '',
		'DribbbleStat': '', 
		'DribbblePlayer': '',
		'DribbbleShot':'',
		'PlacesSearchResult': '',
		'Behance': ''
	};

var UserSchema = new mongoose.Schema({
	id: String,
	uuid: String,
	dashes: String,
	created_at: Number,
});

var User = mongoose.model('User', UserSchema);

var UserSessionSchema = new mongoose.Schema({
	id: String,
	uuid: String,
	is_active: { type: Boolean, default: true },
	is_defective: { type: Boolean, default: false },
	begin_time: Number,
	end_time: Number,
	duration: Number,
	updates: [],
	locations: [],
	clicks: [],
	terms: []
});

UserSessionSchema.statics.createFromCache = function(session) {
	
	var loc = [], splited_loc = session.locations.split('|');
	var up = [], splited_up = session.updates.split('|');
	var cl = [], splited_cl = session.clicks.split('|');
	
	for (var i = 0; i < splited_loc.length; ++i) {
		loc.push({
			timestamp: new Date((splited_loc[i].split(':'))[0]).getTime(),
			latitude: parseInt((splited_loc[i].split(':'))[1]),
			longitude: parseInt((splited_loc[i].split(':'))[2]),
		});
	};

	for (var i = 0; i < splited_up.length; ++i) {
		up.push({
			timestamp: new Date((splited_up[i].split(':'))[0]).getTime(),
			latitude: parseInt((splited_up[i].split(':'))[1]),
			longitude: parseInt((splited_up[i].split(':'))[2]),
		});
	};

	for (var i = 0; i < splited_cl.length; ++i) {
		cl.push({
			timestamp: new Date((splited_loc[i].split(':'))[0]).getTime(),
			latitude: parseInt((splited_loc[i].split(':'))[1]),
			longitude: parseInt((splited_loc[i].split(':'))[2]),
			content_id: splited_cl[i].split(':')[3],
			col_name: splited_cl[i].split(':')[4]
		});
	};

	var user_session = new UserSession({
		id: _objectId(),
		uuid: session.uuid,
		is_active: session.is_active,
		is_defective: session.is_defective,
		begin_time: new Date(session.begin_time).getTime(),
		end_time: new Date(session.end_time).getTime(),
		duration: parseInt(end_time) - parseInt(begin_time),
		updates: up,
		locations: loc,
		clicks: cl,
		terms: []	
	});

	user_session.save(function(error){
		if (error) throw error;
	});
};

var UserSession = mongoose.model('UserSession', UserSessionSchema);

var UserDashSchema = new mongoose.Schema({
	id: { type: String, required: true, unique: true },
	dash_id: String,
	user: { type: String, required: true },
	title: { type: String, required: true },
	location: String,
	description: String,
	credits: String,
	icon_large: String,
	icon_small: String,
	setting_type: String,
	selected_setting: String,
	selected_source_uri: String,
	handler_placeholder: String, 
	is_active: { type: Boolean, default: true },
	data_container: String, // 'body.shots'
	source_uri_scheme: String,
	selected_setting_uri_field: String,
	source_uri_keys: [],
	source_uri_values: [],
	settings: {},
	content_type: [],
	source_uri: [],
	mapper_key: [],
	mapper_value: [],
	mapper_static_key: [],
	mapper_static_value: [],
	has_settings: Boolean,
	collection_name: String
});

UserDashSchema.methods.json = function(pass) {
	var u = this.toObject();
	delete u['_id'];
	delete u['__v'];
	return u;
};

var UserDash = mongoose.model('UserDash', UserDashSchema);

var PrivateDashSchema = new mongoose.Schema({

	id: String,
	confirmation_id: String,
	
	dash_title: String,
	dash_type: String,
	data_container: String,
	source_uri: String,
	source_uri_scheme: String,
	selected_setting_uri_field: String,
	content_type: [],
	mapper_key: [],
	mapper_value: [],
	has_settings: { type: Boolean, default: false },
	source_uri_keys: [],
	source_uri_values: [],
	settings: {},
	content_type: [],
	mapper_key: [],
	mapper_value: [],
	mapper_static_key: [],
	mapper_static_value: [],

	user_id: String,
	user_name: String,
	user_email: String,

	view_count: { type: Number, default: 0 },
	add_count: { type: Number, default: 0 },

	confirmed: { type: Boolean, default: false },
	created_at: Date,
	confirmed_at: Date
});

PrivateDashSchema.methods.json = function(pass) {
	var u = this.toObject();
	delete u['_id'];
	delete u['__v'];
	delete u['confirmation_id'];
	delete u['user_name'];
	delete u['user_email'];
	delete u['user_id'];
	return u;
};

PrivateDashSchema.set('toObject', { virtuals: true });

var PrivateDash = mongoose.model('PrivateDash', PrivateDashSchema);

var ContentSchema = new mongoose.Schema({
	id: String,
	collection_name: String,
	source_id: String,
	resource_uri: String,
	term: String,
	tags: [],
	content_type: [], 
	components: {}
	// desc_comp: {},
	// hero_comp: {},
	// geo_comp: {},
	// footer_comp: {},
	// sports_comp: {},
	// weather_comp: {},
	// stats_comp: {},
	// charts_comp: {},
	// clone_comp: {}
});

var WaitingListEntrySchema = new mongoose.Schema({
	uuid: String,
	uuids: [],
	email: String,
	status: String,
	app_launched: { type: Boolean, default: false },
	added_from: String,
	platform: String,
	confirmed: { type: Boolean, default: false },
	uuid_added_at: [],
	confirmed_by: String,
	confirmed_at: Number,
	app_launched_at: Number,
	created_at: Number
});

PrivateDashSchema.set('toObject', { virtuals: true });

var Content = mongoose.model('Content', ContentSchema);
var WaitingListEntry = mongoose.model('WaitingListEntry', WaitingListEntrySchema);

var NotificationsSchema = new mongoose.Schema({
	id: String,
	uuid: String,
	seen: { type: Boolean, default: false },
	text: String,
	is_active: { type: Boolean, default: true },
	dismissed_at: Number,
	seen_at: Number,
	created_at: Number
});
var Notifications = mongoose.model('Notifications', NotificationsSchema);


////	DASH 	////
function findOneDash(id, callback) {
	
	redisClient.hgetall('dash:'+id, function(error, _dash){

		if (error) throw error;

		if (_dash.dash_type == 'privateDash') return callback(null, _dash);

		if (_dash.setting_type == 'radio') {
			_dash.settings = _dash.settings.split(":");
		}
		_dash.mapper_key = _dash.mapper_key.split(":");
		_dash.mapper_value = _dash.mapper_value.split(":");
		_dash.content_type = _dash.content_type.split(":");
		_dash.source_uri = _dash.source_uri.split("|^._.^|");

		if (_dash.mapper_static_key) _dash.mapper_static_key = _dash.mapper_static_key.split(":");
		if (_dash.mapper_static_value) _dash.mapper_static_value = _dash.mapper_static_value.split(":");

		if (!_dash.source_uri_keys)
			_dash.source_uri_keys = [];
		else 
			_dash.source_uri_keys = _dash.source_uri_keys.split(":");

		if (!_dash.source_uri_values)
			_dash.source_uri_values = [];
		else 
			_dash.source_uri_values = _dash.source_uri_values.split(":");

		callback(null, _dash);
	});
};
function findDash(callback) {

	var d = [];

	redisClient.keys('dash:*', function(error, dashes_ids){
		if (error) throw error;
		for (var i = 0; i < dashes_ids.length; ++i) {

			(function(i){
				
				redisClient.hgetall(dashes_ids[i], function(error, _dash) {
					
					if (error) throw error;

					if (_dash.setting_type == 'radio') {
						_dash.settings = _dash.settings.split(":");
					}

					d.push(_dash);

					if (i == (dashes_ids.length - 1)) callback(null, d);

				});

			}(i));
		}
	});
}; ////	DASH 	////


////	USER 	////
function findOneUser (id, callback) {
	
	redisClient.hgetall('user:'+id, function(error, _user){

		if (error) {
			console.log('ERORR: models.findOneDash');
			throw error;
		}

		_user.notifications = parseInt(_user.notifications);

		if (_user.dashes && _user.dashes.length > 0)
			_user.dashes = _user.dashes.split(":");
		
		callback(null, _user);
	});
};
function createUser(user) {

	redisClient.hmset('user:'+user.uuid, {
		uuid: user.uuid,
		dashes: user.dashes,
		created_at: user.created_at,
		platform: user.platform,
		app_first_launch_at: user.app_first_launch_at,
		status: 1, // 1: just created, 2: waiting for confirmation, 3: confirmed
		notifications: 0
	});

	user.is_active = true;
	user.is_defective = false;
	user.begin_time = user.created_at;
	user.end_time = '';
	user.duration = '';
	user.updates = '';
	user.locations = 'lat:'+user.lat+'|lon:'+user.lat;
	user.clicks = '';
	user.terms = '';

	createSession(user)
};
function addDashUser(uuid, dash_id) {
	
	redisClient.hgetall('user:'+uuid, function(error, user){
		
		var dashes = user.dashes;
		
		dashes = dashes.length > 0 ? dashes.split(":") : [];

		dashes.unshift(dash_id);

		dashes = dashes.length == 1 ? dashes[0] : dashes.join(":");

		// if (dashes.length > 0) dashes += ':';

		// dashes += dash_id;

		redisClient.hset('user:'+uuid, 'dashes', dashes);
	});
};
function removeDashUser(uuid, dash_id) {
	
	redisClient.hgetall('user:'+uuid, function(error, user){
		
		var dashes = user.dashes.split(':');

		dashes.splice(dashes.indexOf(dash_id), 1);
		
		if (dashes.length > 0) dashes = dashes.join(':');
		else dashes = '';

		redisClient.hset('user:'+uuid, 'dashes', dashes);
	});
};
function getDashesUser(uuid, callback) {
	
	redisClient.hget('user:'+uuid, 'dashes', function (error, dashes) {

		if (error) {
			return callback(error);
		}

		if (dashes.length == 0) callback(null, null);

		callback(null, dashes.split('|'));
	});
};
function rearrangeDashesUser(uuid, dashes) {
	dashes = dashes.join(':');
	redisClient.hset('user:'+uuid, 'dashes', dashes);
};
function registerUser(user, callback) {

	WaitingListEntry.count({ confirmed: false }, function(error, count){
		
		if (error) return callback(error);

		WaitingListEntry.findOne({ 
			email: user.email
		}, function(error, wle){
			
			if (error) return callback(error);

			if (!wle) {
				redisClient.hgetall('confirmed:'+user.email, function(error, confirmed){
					if (error) {
						res.send(500);
						throw error;
					}
					if (confirmed || confirmed.length > 0) {
						redisClient.hmset('user:'+user.uuid, 'email', user.email, 'status', 3);
						callback(null, 3, count + 6233);
						var wle = new WaitingListEntry({
							uuid: user.uuid,
							email: user.email,
							app_launched: true,
							status: 3,
							confirmed: true,
							confirmed_by: confirmed.confirmed_by,
							confirmed_at: confirmed.confirmed_at,
							uuids: [user.uuid],
							platform: user.platform,
							uuid_added_at: [new Date().getTime()],
							app_launched: new Date().getTime(),
							created_at: new Date().getTime()
						});
						wle.save();
					}
					else {
						redisClient.hmset('user:'+user.uuid, 'email', user.email, 'status', 2);
						callback(null, 2, count + 6233);
						var wle = new WaitingListEntry({
							uuid: user.uuid,
							email: user.email,
							app_launched: true,
							status: 2,
							uuids: [user.uuid],
							platform: user.platform,
							uuid_added_at: [new Date().getTime()],
							app_launched: new Date().getTime(),
							created_at: new Date().getTime()
						});
						wle.save();
					}
				});
			}
			// user has been registered from website, this is the first time he/she is launching the app
			else if (wle && !wle.app_launched) {
				redisClient.hgetall('confirmed:'+user.email, function(error, confirmed){
					if (error) {
						res.send(500);
						throw error;
					}
					if (confirmed || confirmed.length > 0) {
						redisClient.hmset('user:'+user.uuid, 'email', user.email, 'status', 3);
						callback(null, 3, count + 6233);
						wle.uuid = user.uuid;
						wle.uuids.push(user.uuid);
						wle.uuid_added_at.push(new Date().getTime());
						wle.app_launched = true;
						wle.app_launched_at = new Date().getTime();
						wle.status = 3;
						wle.confirmed = true;
						wle.confirmed_by = confirmed.confirmed_by;
						wle.confirmed_at = confirmed.confirmed_at;
						wle.save();
					}
					else {
						callback(null, 2, count + 6233);
						wle.uuid = user.uuid;
						wle.uuids.push(user.uuid);
						wle.uuid_added_at.push(new Date().getTime());
						wle.app_launched = true;
						wle.app_launched_at = new Date().getTime();
						wle.status = 2;
						redisClient.hmset('user:'+user.uuid, 'email', user.email, 'status', 2); 
						wle.save();
					}
				});
			}
			else if (wle.app_launched && wle.status == 2) {
				callback(null, 2, count + 6233, true);
				if (wle.uuids.indexOf(user.uuid) == -1) {
					wle.uuids.push(user.uuid);
					wle.uuid_added_at.push(new Date().getTime());
					wle.save();
				}
			}
			else if (wle.app_launched && wle.status == 3) {
				callback(null, 3, count + 6233);
				redisClient.hmset('user:'+user.uuid, 'email', user.email, 'status', 3); 
				if (wle.uuids.indexOf(user.uuid) == -1) {
					wle.uuids.push(user.uuid);
					wle.uuid_added_at.push(new Date().getTime());
					wle.save();
				}
			}
			else {
				callback(404);
			}
		});
	});
}; ////	USER 	////


////	SESSION 	////
function createSession(session) {
	
	// console.log(session)

	redisClient.hmset('session:'+session.uuid, {
		uuid: session.uuid,
		created_at: session.created_at,
		is_active: session.is_active || true,
		is_defective: session.is_defective || false,
		begin_time: session.begin_time || new Date().getTime().toString(),
		end_time: '',
		duration: '',
		updates: '',
		locations: session.locations,
		clicks: '',
		terms: ''
	});
};
function deleteSession(uuid) {
	redisClient.del('session:'+uuid);
};
function createOrUpdateSession(options) {

	redisClient.hgetall('session:'+options.uuid, function(error, session){
		
		if (error) return callback(error);

		if (!session || session.length == 0) 
			return createSession(options, callback);

		session.is_active = false;
		session.is_defective = true;
		session.end_time = new Date().getTime().toString();

		UserSession.createFromCache(session);

		session.is_active = true;
		session.is_defective = false;
		session.begin_time = options.created_at;
		session.end_time = '';
		session.locations = 'lat:'+options.lat+'|lon:'+options.lat;

		createSession(options);
	});
};
function clickSession(click) {
	// Format: 	'timestamp:uuid:latitude:longitude:content_id:col_name'
	redisClient.hget('session:'+click.uuid, 'clicks', function (error, clicks) {

		if (error) throw error;

		if (clicks.length > 0) {
			clicks += '|';
		}

		clicks += click.timestamp+':'+click.latitude+':'+click.longitude+':'+content_id+':'+col_name;

		redisClient.hset('session:'+click.uuid, 'clicks', clicks);
	});
};
function updateSession(update) {

	redisClient.hget('session:'+update.uuid, 'updates', function (error, updates) {
		if (error) throw error;

		if (updates.length > 0) {
			updates += '|';
		}

		updates += update.timestamp+':'+update.latitude+':'+update.longitude;

		redisClient.hset('session:'+update.uuid, 'updates', updates);
	});
}; ////	SESSION 	////


////	Helpers 	////
function _objectId() {
	var id = (new mongoose.Types.ObjectId).toString();
	id = crypto.createHash('sha1').update(id).digest('hex');
	return (new Buffer(id).toString('base64').replace(/=/g, ""));
};
function config (m, r) {
	redisClient = r;
	return self;
};
function cipher (text) {
	// change the key
	var key = 'NmU5MTgzYzJhNjM1N2JkZjhhMjAxZDc5OWM0ODFlZDYzMTYxNmQ3Ng';

	var cipher = crypto.createCipher('aes-256-cbc', key);
	var crypted = cipher.update(text, 'utf8', 'hex');
	crypted += cipher.final('hex');
	return crypted;		
};
function decipher(text){
	var key = 'NmU5MTgzYzJhNjM1N2JkZjhhMjAxZDc5OWM0ODFlZDYzMTYxNmQ3Ng';
	var decipher = crypto.createDecipher('aes-256-cbc', key);
	var dec = decipher.update(text,'hex','utf8');
	dec += decipher.final('utf8');
	return dec;
};
function ready(callback) {
	mongoose.connect(connectionString, function(err){
		if (err) throw err;
		callback();
	});
}; ////	Helpers 	////

var Dash = {
	findOne: findOneDash,
	find: findDash
};

var User = {
	findOne: findOneUser,
	create: createUser,
	addDash: addDashUser,
	removeDash: removeDashUser,
	getDashes: getDashesUser,
	rearrangeDashes: rearrangeDashesUser,
	register: registerUser
};

var Session = {
	create: createSession,
	createOrUpdate: createOrUpdateSession,
	deleteSession: deleteSession, 
	click: clickSession,
	update: updateSession
};

exports.config = config;
exports.id = _objectId;
exports.User = User;
exports.UserSession = UserSession;
exports.UserDash = UserDash;
exports.Dash = Dash;
exports.PrivateDash = PrivateDash;
exports.Content = Content;
exports.Session = Session;
exports.ready = ready;
exports.cipher = cipher;
exports.decipher = decipher;
exports.WaitingListEntry = WaitingListEntry;
exports.Notifications = Notifications;