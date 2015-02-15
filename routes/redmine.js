var express = require('express'),
	router = express.Router();

router.get('/trackers', function (req, res, next) {
	redmine.get('trackers', 'json').success(function (data) {
		console.log(data);
		res.json(data);
	}).error(function (err) {
		console.log(err);
		res.status(404).json(err);
	});
});

router.get('/projects/:id', function(req, res, next) {
	redmine.get('projects/' + req.params.id, {
		include: 'trackers'
	}).success(function (data) {
		console.log(data);
		res.json(data);
	}).error(function (err) {
		console.log(err);
		res.status(404).json(err);
	});
});

module.exports = router;