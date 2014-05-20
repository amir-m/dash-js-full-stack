module.exports = function (mongoose) {

	

	var _objectId = function() {
			return new Buffer((new mongoose.Types.ObjectId).toString()).toString('base64');
		}

	

	
	

	return {
		User: User,
		UserSession: UserSession,
		objectId: _objectId
	}
};