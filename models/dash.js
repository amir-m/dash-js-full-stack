var self = this,
	mongoose,
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
	'dash:NTI5NjJmYzUyNzQ3ZjUxADLiQDBzMDAy'  ],
	collections = {
	'PopularDribbleShot':  '',
	'EveryoneDribbleShot': '',
	'DebutsDribbleShot': '',
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
	'Behance': ''};

var DashSchema = new mongoose.Schema({
	id: {type: String, required: true, unique: true},
	title: {type: String, required: true},
	uri: String,
	dash_type: String,
	description: String,
	credits: String,
	icon_large: String,
	icon_small: String,
	setting_type: String
	settings: {},
});

var UserDashSchema = new mongoose.Schema({
	id: { type: String, required: true, unique: true },
	dash_id: String,
	uuid: { type: String, required: true },
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
	is_active: {type: Boolean, default: true},
	settings: {}
});

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
	source_id: String,
	content_type: String,
	term: String,
	slideshow: {},
	news: {},
	stats: {},
	user_profile: {},
	content: {},
	geo: {},
	collection_name: String
});

PrivateDashSchema.set('toObject', { virtuals: true });

var Content = mongoose.model('', ContentSchema);

function _objectId() {
	var id = (new mongoose.Types.ObjectId).toString();
	id = crypto.createHash('sha1').update(id).digest('hex');
	return (new Buffer(id).toString('base64').replace(/=/g, ""));
};

function config (m, r) {
	mongoose = m;
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

exports.config = config;
exports.id = _objectId;
exports.Dash = Dash;
exports.PrivateDash = PrivateDash;
exports.UserDash = UserDash;
exports.Content = Content;
