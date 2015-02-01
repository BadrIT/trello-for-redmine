var express = require('express'),
	router = express.Router(),
	fs = require('fs');

/* GET dashboard data. */
router.get('/', function(req, res, next) {
	var dashboard = JSON.parse(fs.readFileSync('dashboard.json', 'utf8'));
	res.json(dashboard);
});

module.exports = router;
