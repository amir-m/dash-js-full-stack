var mongoose = require('mongoose'),
	connectionString = process.env.MONGOLAB_URI ? 
		process.env.MONGOLAB_URI : "mongodb://localhost/dashbook";

mongoose.connect(connectionString, function(err){
	if (err) throw err;

	console.log(require('./models/dash')(mongoose).objectId())
});
