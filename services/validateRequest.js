var redis = require("redis"),
    redis_client = redis.createClient();

module.exports = function(req, res, next) {
	if (req.url == "/login" || req.url == "/redmine/login/user") {
		next();
	} else {
		var params = req.params[0].split("/");
		var api_key = params[params.length - 1] ;
		redis_client.get(api_key, function (err, data) {
        	if(data || req.session.current_api_key) {
        		next();
        	} else {
        		res.redirect('/login');
        	}
    	});
	}
}