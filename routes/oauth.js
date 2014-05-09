module.exports = function  (models) {
	
	var twitter_signin = function (req, res, next) {
		console.log('twitter')
		res.send(200);
	};

	var read = function (req, res, next) {
		
	};

	return {
		twitter_signin: twitter_signin,
		read: read
	}
}