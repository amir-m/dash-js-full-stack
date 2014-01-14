module.exports = function (mongoose) {

	var UserSchema = new mongoose.Schema({
		_id: { type: String, required: true, unique: true },
		version: String
	});

	var _objectId = function() {
			return new Buffer((new mongoose.Types.ObjectId).toString()).toString('base64');
		}

	var User = mongoose.model('User', UserSchema);

	
	var UserSession = mongoose.model('UserSession', new mongoose.Schema({
		_id: String,
		uuid: String,
		isActive: {type: Boolean, default: true},
		isDefective: {type: Boolean, default: false},
		beginTime: {type: Number, default: new Date().getTime()},
		endTime: Number,
		duration: Number,
		updateTimes: [],
		locations: [],
		clicks: [],
		terms: []
	}));

	return {
		User: User,
		UserSession: UserSession,
		objectId: _objectId
	}
};