var redis = require("redis"),
    redis_client = redis.createClient();

module.exports = function(req, res, next) {
	
	if (req.url == "/login" || req.url == "/redmine/login/user") {
		next();
	} else {
		redis_client.get(req.params.api_key, function (err, data) {
        	if(data) {
        		next();
        	} else {
        		res.redirect('/login');
        		//res.sendFile("login.html", { root: __dirname + "/../public/templates/trello" });
        	}
    	});
	}
}