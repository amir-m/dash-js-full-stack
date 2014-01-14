module.exports = function (mongoose) {

	var DashSchema = new mongoose.Schema({
		_id: {type: String, required: true, unique: true},
		title: {type: String, required: true},
		uri: String,
		dashType: String,
		description: String,
		credits: String,
		iconLarge: String,
		iconSmall: String,
		settings: {},
		settingType: String
	});

	var UserDashSchema = new mongoose.Schema({
		_id: { type: String, required: true, unique: true },
		dash_id: String,
		user: { type: String, required: true },
		title: { type: String, required: true },
		dashType: String,
		location: String,
		uri: String,
		subTitle: String,
		description: String,
		credits: String,
		iconLarge: String,
		iconSmall: String,
		settings: {},
		settingType: String,
		selectedSetting: String,
		isActive: {type: Boolean, default: true}
	});

	var _objectId = function() {
		return new Buffer((new mongoose.Types.ObjectId).toString()).toString('base64');
	};

	var Dash = mongoose.model('Dash', DashSchema);
	var UserDash = mongoose.model('UserDash', UserDashSchema);

	var PopularDribbleShot = mongoose.model('PopularDribbleShot', new mongoose.Schema({
		_id: String,
		by: String,
		index: Number,
		id: String,
		slideshow: {
			title: String,
			createdAt: Date,
			resourceUri: String, 
			resourceImageUri: String,
			imageUri: String,
			author: String,
			avatar: String
		},
		colName: {type: String, default: 'PopularDribbleShot'}
	}));

	var EveryoneDribbleShot = mongoose.model('EveryoneDribbleShot', new mongoose.Schema({
		_id: String,
		by: String,
		index: Number,
		id: String,
		slideshow: {
			title: String,
			createdAt: Date,
			resourceImageUri: String,
			resourceUri: String,
			imageUri: String,
			author: String,
			avatar: String
		},
		colName: {type: String, default: 'EveryoneDribbleShot'}
	}));

	var DebutsDribbleShot = mongoose.model('DebutsDribbleShot', new mongoose.Schema({
		_id: String,
		by: String,
		index: Number,
		id: String,
		slideshow: {

			title: String,
			createdAt: Date,
			resourceImageUri: String,
			resourceUri: String,
			imageUri: String,
			author: String,
			avatar: String
		},
		colName: {type: String, default: 'DebutsDribbleShot'}
	}));

	var BusinessInsider = mongoose.model('BusinessInsiderFeed', new mongoose.Schema({
		news: {
			title: String,
			from: String, 
			resourceUri: String, 
			pubDate: Date,
			content: String,
		},
		colName: {type: String, default: 'BusinessInsiderFeed'}
	}));

	var Wired = mongoose.model('WiredFeed', new mongoose.Schema({
		news: {
			title: String,
			from: String, 
			resourceUri: String, 
			pubDate: Date,
			content: String,
		},
		colName: {type: String, default: 'WiredFeed'}
	}));

	var VentureBeat = mongoose.model('VentureBeatFeed', new mongoose.Schema({
		news: {
			title: String,
			from: String, 
			resourceUri: String, 
			pubDate: Date,
			content: String,
		},
		colName: {type: String, default: 'VentureBeatFeed'}
	}));

	var TechCrunch = mongoose.model('TechCrunchFeed', new mongoose.Schema({
		news: {
			title: String,
			from: String, 
			resourceUri: String, 
			pubDate: Date,
			content: String,
		},
		colName: {type: String, default: 'TechCrunchFeed'}
	}));

	var NewYorkTimes = mongoose.model('NewYorkTimesFeed', new mongoose.Schema({
		news: {
			title: String,
			from: String, 
			resourceUri: String, 
			pubDate: Date,
			content: String,
		},
		colName: {type: String, default: 'NewYorkTimesFeed'}
	}));

	var Mashable = mongoose.model('MashableFeed', new mongoose.Schema({
		news: {
			title: String,
			from: String, 
			resourceUri: String, 
			pubDate: Date,
			content: String,
		},
		colName: {type: String, default: 'MashableFeed'}
	}));

	var IncCom = mongoose.model('IncComFeed', new mongoose.Schema({
		news: {
			title: String,
			from: String, 
			resourceUri: String, 
			pubDate: Date,
			content: String,
		},
		colName: {type: String, default: 'IncComFeed'}
	}));

	var Forbes = mongoose.model('ForbesFeed', new mongoose.Schema({
		news: {
			title: String,
			from: String, 
			resourceUri: String, 
			pubDate: Date,
			content: String,
		},
		colName: {type: String, default: 'ForbesFeed'}
	}));

	var FastCompany = mongoose.model('FastCompanyFeed', new mongoose.Schema({
		news: {
			title: String,
			from: String, 
			resourceUri: String, 
			pubDate: Date,
			content: String,
		},
		colName: {type: String, default: 'FastCompanyFeed'}
	}));

	var ESPN = mongoose.model('ESPNFeed', new mongoose.Schema({
		news: {
			title: String,
			from: String, 
			resourceUri: String, 
			pubDate: Date,
			content: String,
		},
		colName: {type: String, default: 'ESPNFeed'}
	}));

	var Core77 = mongoose.model('Core77Feed', new mongoose.Schema({
		news: {
			title: String,
			from: String, 
			resourceUri: String, 
			pubDate: Date,
			content: String,
		},
		colName: {type: String, default: 'Core77Feed'}
	}));

	var DesignMilk = mongoose.model('DesignMilkFeed', new mongoose.Schema({
		news: {
			title: String,
			from: String, 
			resourceUri: String, 
			pubDate: Date,
			content: String,
		},
		colName: {type: String, default: 'DesignMilkFeed'}
	}));

	SideBarIO = mongoose.model('SideBarIOFeed', new mongoose.Schema({
		news: {
			title: String,
			from: String, 
			resourceUri: String, 
			pubDate: Date
		},
		colName: {type: String, default: 'SideBarIOFeed'}
	}));

	var BehanceSearchResult = mongoose.model('BehanceSearchResult', new mongoose.Schema({
		_id: String,
		id: String,
		term: String,
		slideshow: {
			title: String, 
			pubDate: Date,	
			fetchDate: {type: Date, default: new Date()},
			resourceUri: String, 
			resourceImageUri: String,
			avatar: String, 
			imageUri: String,
			author: String
		},
		colName: {type: String, default: 'BehanceSearchResult'} 
	}));

var DribbbleStat = mongoose.model('DribbbleStat', new mongoose.Schema({
		_id: String,
		id: String,
		username: String,
		stats: {
			title: String, 
			pubDate: Date,	
			fetchDate: {type: Date, default: new Date()},
			resourceUri: String, 
			// resourceImageUri: String,
			avatar: String, 
			detail1: Number,
			detail2: Number,
			detail3: Number,
			label1: String,
			label2: String,
			label3: String
		},
		colName: {type: String, default: 'DribbbleStat'} 
	}));

	var DribbblePlayer = mongoose.model('DribbblePlayer', new mongoose.Schema({
		_id: String,
		id: String,
		modelType: {type: String, default: 'User'},
		name: String,
		location: String,
		followers_count: Number,
		draftees_count: Number,
		likes_count: Number,
		likes_received_count: Number,
		comments_count: Number,
		comments_received_count: Number,
		rebounds_count: Number,
		rebounds_received_count: Number,
		url: String,
		avatar_url: String,
		username: String,
		twitter_screen_name: String,
		website_url: String,
		drafted_by_player_id: Number,
		shots_count: Number,
		following_count: Number,
		created_at: Date,

		colName: {type: String, default: 'DribbblePlayer'} 
	}));

	var DribbbleShot = mongoose.model('DribbbleShot', new mongoose.Schema({
		_id: String,
		id: String,
		modelType: {type: String, default: 'UserContent'},
		title: String,
		views_count: Number,
		image_url: String,
		likes_count: Number,
		comments_count: Number,
		rebounds_count: Number,
		url: String,
		username: String,
		created_at: Date,

		colName: {type: String, default: 'DribbbleShot'} 
	}));

	PlacesSearchResult = mongoose.model('PlacesSearchResult', new mongoose.Schema({
		_id: String,
		id: String,
		term: String,
		geo: {
			title: String, 
			address: String,
			location: {},
			placeType: [],
			reference: String,	
			fetchDate: {type: Date, default: new Date()},
			resourceUri: String
		},
		colName: {type: String, default: 'PlacesSearchResult'}
	}));

	var BadInput = mongoose.model('BadInput', new mongoose.Schema({
		_id: String,
		input: String,
		uuid: String,
		modelType: String,
		created_at: {type: Date, default: new Date()},
		colName: {type: String, default: 'BadInput'} 
	}));

	var Behance = mongoose.model('Behance', new mongoose.Schema({
		_id: String,
		id: String,
		behanceType: String,
		slideshow: {
			title: String, 
			pubDate: Date,	
			fetchDate: {type: Date, default: new Date()},
			resourceUri: String, 
			resourceImageUri: String,
			avatar: String, 
			imageUri: String,
			author: String,
			tags: []
		},
		colName: {type: String, default: 'Behance'} 
	}));

	return {
		Dash: Dash,
		UserDash: UserDash,
		objectId: _objectId,
		PopularDribbleShot: PopularDribbleShot,
		EveryoneDribbleShot: EveryoneDribbleShot,
		DebutsDribbleShot: DebutsDribbleShot,
		BusinessInsider: BusinessInsider,
		Wired: Wired,
		VentureBeat: VentureBeat,
		TechCrunch: TechCrunch,
		NewYorkTimes: NewYorkTimes,
		Mashable: Mashable,
		IncCom: IncCom,
		Forbes: Forbes,
		FastCompany: FastCompany,
		ESPN: ESPN,
		Core77: Core77,
		SideBarIO: SideBarIO,
		DesignMilk: DesignMilk,
		BehanceSearchResult: BehanceSearchResult,
		PlacesSearchResult: PlacesSearchResult,
		DribbbleStat: DribbbleStat,
		DribbblePlayer: DribbblePlayer,
		DribbbleShot: DribbbleShot,
		BadInput: BadInput,
		Behance: Behance
	}
};