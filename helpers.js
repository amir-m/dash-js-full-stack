module.exports = function(models) {

	// dribblle, dribbble stats ad behance 
	var defaultDashes = ['NTI5NjJmYzUyMzQ3ZjUxZDliMDAwMDAx', 'NTJhOWRmMGYxODNiNTAwMDAwMDAwMDAx', 'NTI5NjMyNWY1OGM5YmIzNzliMDAwMDAx']

	function createDefaultDashes(uuid) {
		console.log('about to create default dashes for ', uuid);
		models.dashes.Dash.find({ _id: { $in: defaultDashes} }, 
		function(error, dashes){
			
			if (error) {
				console.log(error)
				return res.send(500);
				throw error
			};


			for (var i = 0; i < dashes.length; ++i) {
				var selected = '';			

				if (dashes[i].settingType == 'radio')
					selected = dashes[i].settings[0];
				else if (dashes[i].settingType == 'text') {
					selected = dashes[i].settings;	
				}

				models.dashes.UserDash.create({
					_id: models.dashes.objectId(),
					dash_id: dashes[i]._id,
					dashType: dashes[i].dashType,
					user: uuid,
					title: dashes[i].title,
					subTitle: dashes[i].subTitle,
					description: dashes[i].description,
					credits: dashes[i].credits,
					iconLarge: dashes[i].iconLarge,
					iconSmall: dashes[i].iconSmall,
					settings: dashes[i].settings,
					selectedSetting: selected,
					settingType: dashes[i].settingType
				}, function(error){
					if (error) {
						console.log(error)
					}
					else console.log('default dash created for user %s', uuid);
				});
				
			}
			
		});
	};

	return {
		createDefaultDashes: createDefaultDashes
	}
};