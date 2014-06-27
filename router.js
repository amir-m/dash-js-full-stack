module.exports = function(routes, app, models, redisClient) {
	app.get('/partials/*', function(req, res, next){
		res.set({
			'Content-type': 'text/html; charset=utf-8'
		});

		res.sendfile('app/directive/partials/'+req.params[0]);
	});
	app.get('/img/*', function(req, res, next){
		res.set({
			'Content-type': 'text/html; charset=utf-8'
		});

		res.sendfile('app/img/'+req.params[0]);
	});

	app.get('/dashes/:id', routes.dashes.read);
	app.get('/content', routes.dashes.readData);
	app.get('/dashes', routes.dashes.library);
	app.get('/dashes/:id/settings', routes.settings.read);
	app.get('/email/count', routes.index.count);
	app.get('/me/:id', routes.index.getMe);
	app.get('/notifications/:uuid', routes.index.getNotifications);
	
	app.get('/fixsomething', function (req, res) {
		res.send(200);
		require('./helpers')(models, redisClient).fixSomething()
	});

	// app.get('/testycool', routes.dashes.create);

	app.post('/init/:id', routes.index.init);
	app.post('/update', routes.index.update);
	app.post('/email', routes.index.email);
	app.post('/relaunch', routes.index.relaunch);
	// app.post('/twitter/signin', routes.oauth.twitter_signin);
	app.post('/exit', routes.index.exit);
	app.post('/readcontent', routes.dashes.uirOpened); 
	app.post('/dashes/:id/settings', routes.settings.update); 
	app.post('/dash/private/:id/settings', routes.settings.postPrivateDashSettingsUpdate); 
	app.post('/dash/rearrange', routes.dashes.rearrange); 
	app.post('/notification/:id/seen', routes.index.postNotificationSeen); 
	app.post('/notification/:id/dismiss/:uuid', routes.index.postNotificationDismiss); 
	
	app.put('/dashes/:id/:uuid', routes.dashes.create);
	app.put('/dashes/:id/accounts', routes.accounts.create);
	app.put('/dashes/:id/settings', routes.settings.create);

	app.delete('/dashes/:id/accounts/:accId', routes.accounts.remove);
	app.delete('/dashes/:id/:uuid', routes.dashes.remove);

}