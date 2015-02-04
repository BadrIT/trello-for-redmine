var express = require('express'),
	router = express.Router(),
	fs = require('fs');

/* GET dashboard data. */
router.get('/load', function(req, res, next) {
	var dashboard = JSON.parse(fs.readFileSync('dashboard.json', 'utf8'));
	res.json(dashboard);
});

router.post('/save', function(req, res, next) {
	var dashboard = req.body;
	fs.writeFile('dashboard.json', JSON.stringify(dashboard), function(err) {
		if(err) {
			console.log(err);
			res.status(401).json({"status": "failed"});
		} else {
			// console.log('SAVED: 200 OK');
			res.json({"status": "success"});
		}
	});

});

module.exports = router;
