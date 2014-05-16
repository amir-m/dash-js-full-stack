var user = {
	day1: {
		likes: 21,
		comments: 3,
		followers: 1
	},
	day2: {
		likes: 41,
		comments: 11,
		followers: 0
	},
	day3: {
		likes: 5,
		comments: 2,
		followers: 0
	},
	day4: {
		likes: 2,
		comments: 2,
		followers: 0
	},
	day5: {
		likes: 56,
		comments: 8,
		followers: 2
	},
	day6: {
		likes: 110,
		comments: 10,
		followers: 3
	},
	day7: {
		likes: 43,
		comments: 7,
		followers: 0
	}
}, totalLikes = 0, totalComments = 0, totalFollowers = 0, avgLikes, avgComments, avgFollowers, 
	minLikes, maxLikes,
	minComments, maxComments,
	minFollowers, maxFollowers;

var count = 1;

for (var day in user) {
	
	++count;

	if (day == 'day1') {
		minLikes = user[day].likes;; 
		maxLikes = user[day].likes;;
		minComments = user[day].comments; 
		maxComments = user[day].comments;
		minFollowers = user[day].followers; 
		maxFollowers = user[day].followers;
	}

	totalLikes += user[day].likes;
	totalComments += user[day].comments;
	totalFollowers += user[day].followers;

	if (minLikes > user[day].likes) minLikes = user[day].likes;
	if (maxLikes < user[day].likes) maxLikes = user[day].likes;
	if (minComments > user[day].comments) minComments = user[day].comments;
	if (maxComments < user[day].comments) maxComments = user[day].comments;
	if (minFollowers > user[day].followers) minFollowers = user[day].followers;
	if (maxFollowers < user[day].followers) maxFollowers = user[day].followers;

}

avgLikes = totalLikes / count;
avgComments = totalComments / count;
avgFollowers = totalFollowers / count;

var likesWeigth = avgLikes / maxLikes;
var commentsWeigth = avgComments / maxComments;
var followersWeigth = avgFollowers / maxFollowers;


var magicLikes = 100 / (maxLikes - minLikes);
var magicComments = 100 / (maxComments - minComments);
var magicFollowers = 100 / (maxFollowers - minFollowers),
minMagicNumber, maxMagicNumber;

user['minPotential'] = {
	likes: minLikes,
	comments: minComments,
	followers: minFollowers
}

user['maxPotential'] = {
	likes: maxLikes,
	comments: maxComments,
	followers: maxFollowers
}

var SPECS = 3; // counts the number of specs in a day, i.e likes, comments, followers, views, etc

for (var day in user) {

	user[day].likePercent = magicLikes * (user[day].likes - minLikes);
	user[day].commentPercent = magicComments * (user[day].comments - minComments);
	user[day].followersPercent = magicFollowers * (user[day].followers - minFollowers);

	user[day].magicNumber = (user[day].likePercent * likesWeigth + 
		user[day].commentPercent * commentsWeigth + user[day].followersPercent + followersWeigth) / 
		(SPECS + likesWeigth + commentsWeigth + followersWeigth);
}

for (var day in user) {
	if (day == 'minPotential') {
		minMagicNumber = maxMagicNumber = user[day].magicNumber;
	}

	if (minMagicNumber > user[day].magicNumber) minMagicNumber = user[day].magicNumber;
	if (maxMagicNumber < user[day].magicNumber) maxMagicNumber = user[day].magicNumber;
}

var magicMagicNumber = 100 / (maxMagicNumber - minMagicNumber);

for (var day in user) {
	user[day].magicPercent = magicMagicNumber * (user[day].magicNumber - minMagicNumber);
}


// console.log(minMagicNumber, maxMagicNumber);
console.log(user);


