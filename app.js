stackTraceLimit = Infinity;

var cluster = require('cluster'),
	express = require("express"),
	redis = require('redis'),
	app = express(),
	mongoose = require('mongoose'),
	cookie = require('cookie'),
    publisher, workers = {},
    cpuCount = require('os').cpus().length;
var forked = false;


publisher = redis.createClient(6379, '54.185.233.146');

var models = {
	dashes: require('./models/dash')(mongoose, publisher),
	users: require('./models/user') (mongoose)
};

// require('./helpers')(models, publisher).insertDashesToRedisBackend();

// setTimeout(function() {
// 	models.dashes.Dash.find(function(dashes){
// 		console.log(dashes);
// 	});
// }, 2000);

require('./config')(express, app, mongoose, cookie, models, publisher);

var routes = {
	index: require('./routes/index')(models, publisher, cookie),
	dashes: require('./routes/dashes')(models, publisher, mongoose),
	settings: require('./routes/settings')(models, publisher),
	accounts: require('./routes/accounts').init(models)	
};

require('./router')(routes, app);

if (cluster.isMaster) {
	for (var i = 0; i < cpuCount; i++) {
		spawn();
	}
	cluster.on('exit', function(worker) {
		console.log('worker ' + worker.id + ' died. spawning a new process...');
		delete workers[worker.pid];
		worker.kill();
		spawn();
	});
} else {
	app.listen(app.get('port'), function() {
		console.log("Listening on " + app.get('port'));
	});
}

publisher.on('error', function(error){
	console.log(error);
});

// redisSub.on('error', function(error){
// 	console.log(error);
// });

function spawn(){
	var worker = cluster.fork();
	workers[worker.id] = worker;
	console.log('worker ' + worker.id + ' was spawned as a new process...');
	return worker;
};

