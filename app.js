var cluster = require('cluster'),
	express = require("express"),
	redis = require('redis'),
	zmq = require('zmq'),
	app = express(),
	mongoose = require('mongoose'),
	cookie = require('cookie'),
    publisher, workers = {},
    cpuCount = require('os').cpus().length;
var forked = false;

var models = {
	dashes: require('./models/dash')(mongoose),
	users: require('./models/user') (mongoose)
};

publisher = redis.createClient(6379, '54.203.69.195');


require('./config')(express, app, mongoose, cookie, models, publisher);

var routes = {
	index: require('./routes/index')(models, publisher, cookie),
	dashes: require('./routes/dashes')(models, publisher, mongoose),
	accounts: require('./routes/accounts')(models),
	settings: require('./routes/settings')(models, publisher)
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

