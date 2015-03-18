var express = require('express'),
	router = express.Router(),
	fs = require('fs'),
	redis = require("redis"),
    redis_client = redis.createClient();

// GET config data
router.get('/config/:api_key', function(req, res, next) {
	var config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
	res.json(config);
});

// SAVE user list
router.post('/config/lists/:api_key', function(req, res, next) {
	var lists = req.body;
	redis_client.set(req.params.api_key + "_lists", lists);
	res.status(200);
});

// GET user Lists
router.get('/config/lists/:api_key', function(req, res, next) {
	redis_client.get(req.params.api_key + "_lists", function (err, data) {
		if(err) {
			res.status(404).json(err);
		}
		
		if(data) {
			res.json(data);
		} else {
			res.status(200);
		}
    	
    });
});

module.exports = router;
