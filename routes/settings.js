var express = require('express'),
	router = express.Router(),
	fs = require('fs');

// GET config data
router.get('/config', function(req, res, next) {
	var config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
	res.json(config);
});

module.exports = router;
