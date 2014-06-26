stackTraceLimit = Infinity;

var cluster = require('cluster'),
	express = require("express"),
	redis = require('redis'),
	app = express(),
	mongoose = require('mongoose'),
	cookie = require('cookie'),
    redisClient, workers = {},
    cpuCount = require('os').cpus().length;
var forked = false;

// redisClient = redis.createClient(6379, '54.185.233.146');
redisClient = redis.createClient(6379, 'dbk-cache.serzbc.0001.usw2.cache.amazonaws.com');

// var models = {
// 	dashes: require('./models/dash').config(mongoose, redisClient),
// 	users: require('./models/user').config(mongoose)
// };

var models = require('./models').config(mongoose, redisClient);


setTimeout(function() {
	// console.log('in timeout');
	// require('./helpers')(models, redisClient).confirmUser('amir@doob.io', 'Amir', function(error){
	// 	if (error) throw error;
	// 	console.log('amir@doob.io just got confirmed');
	// });

	// require('./helpers')(models, redisClient).insertDashesToRedisBackend();
	// require('./helpers')(models, redisClient).deleteAllUsers();
	// require('./helpers')(models, redisClient).fixSomething();

}, 3000);



require('./config')(express, app, mongoose, cookie, models, redisClient);

var routes = {
	index: require('./routes/index')(models, redisClient, cookie),
	dashes: require('./routes/dashes')(models, redisClient, mongoose),
	settings: require('./routes/settings')(models, redisClient),
	accounts: require('./routes/accounts').init(models)	
};

require('./router')(routes, app, models, redisClient);

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

redisClient.on('error', function(error){
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

