var self = this,
	mongoose = require('mongoose'),
	crypto = require('crypto'),
	redisClient,
	dashes_ids = [ 
		'dash:NTJhOWRmMGYxODNiNTAwMDAwMDAwMDAx',
		'dash:NTI5NjNiMGYwZWZhNzI1ZTliMDAwMDAx',
		'dash:NTI5NjJmYzUyMzQ3ZjUxZDliMDAwMDAx',
		'dash:NTI5NjM5ZTlmOGZjY2Q1ODliMDAwMDAx',
		'dash:NTI5NjM4NTg2NGZmOGU0YzliMDAwMDAx',
		'dash:NTI5NjNhNjFmNTliN2Y1YzliMDAwMDAx',
		'dash:NTI5NjMyNWY1OGM5YmIzNzliMDAwMDAx',
		'dash:NTI5NjM2YmZiMTcxMzg0NTliMDAwMDAx',
		'dash:NTI5NjJmYzUyNzQ3ZjUxADLiQDBzMDAy'   ],
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

var DashSchema = new mongoose.Schema({
	id: {type: String, required: true, unique: true},
	title: {type: String, required: true},
	uri: String,
	dash_type: String,
	description: String,
	credits: String,
	icon_large: String,
	icon_small: String,
	setting_type: String,
	handler_placeholder: String,
	collection_name: String,
	settings: {}
});

var UserDashSchema = new mongoose.Schema({
	id: { type: String, required: true, unique: true },
	dash_id: String,
	user: { type: String, required: true },
	title: { type: String, required: true },
	dash_type: String,
	location: String,
	uri: String,
	description: String,
	credits: String,
	icon_large: String,
	icon_small: String,
	setting_type: String,
	selected_setting: String,
	handler_placeholder: String, 
	is_active: {type: Boolean, default: true},
	collection_name: String,
	settings: {}
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
	
	dash_type: { type: String, default: 'privateDash'},
	api_end_point: String,
	dash_title: String,
  	type_indicator: String,
  	header: String,
  	text: String,
  	main_img: String,
  	footer: String,
  	image_key: String,
  	container: String,
  	footer_key: String,

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
	content_type: [], 
	components: {}
	// desc_comp: {},
	// hero_comp: {},
	// geo_comp: {},
	// footer_comp: {},
	// sports_comp: {},
	// weather_comp: {},
	// stats_comp: {},
	// charts_comp: {}
});

PrivateDashSchema.set('toObject', { virtuals: true });

var Content = mongoose.model('Content', ContentSchema);

function _objectId() {
	var id = (new mongoose.Types.ObjectId).toString();
	id = crypto.createHash('sha1').update(id).digest('hex');
	return (new Buffer(id).toString('base64').replace(/=/g, ""));
};

function config (m, r) {
	redisClient = r;
	return self;
};

function findOneDash(id, callback) {
	redisClient.hgetall('dash:'+id, function(error, _dash){

		if (error) throw error;

		if (_dash.setting_type == 'radio') {
			_dash.settings = _dash.settings.split(":");
		}

		callback(null, _dash);

	});
};

function findDash(callback) {

	var d = [];

	for (var i = 0; i < dashes_ids.length; ++i) {
		
		// redisClient.del(dashes_ids[i]);

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
};

function createUser(user) {

	redisClient.hmset('user:'+user.uuid ,{
		uuid: user.uuid,
		dashes: user.dashes,
		created_at: user.created_at
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

		if (dashes.length > 0) dashes += '|';

		dashes += dash_id;

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

var Dash = {
	findOne: findOneDash,
	find: findDash
};

var User = {
	create: createUser,
	addDash: addDashUser,
	getDashes: getDashesUser
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
