var express = require('express'),
	router = express.Router();

// list all trackers in redmine
router.get('/trackers', function (req, res, next) {
	redmine.get('trackers', 'json').success(function (data) {
		console.log(data);
		res.json(data);
	}).error(function (err) {
		console.log(err);
		res.status(404).json(err);
	});
});

// get issues of user in a specific project
router.get('/users/:user_id/projects/:project_id/issues', function(req, res, next) {
	redmine.get('issues', {
		project_id: req.params.project_id,
		assigned_to_id: req.params.user_id
	}).success(function (data) {
		console.log(data);
		res.json(data);
	}).error(function (err) {
		console.log(err);
		res.status(404).json(err);
	});
});

// get projects of specific user
router.get('/users/:user_id/projects', function(req, res, next) {
	redmine.get('users/' + req.params.user_id, {
		include: 'memberships'
	}).success(function (data) {
		console.log(data);
		res.json(data.user.memberships);
	}).error(function (err) {
		console.log(err);
		res.status(404).json(err);
	});
});

// get issues assigned to specific user
router.get('/users/:user_id/issues', function(req, res, next) {
	redmine.get('issues' , {
		assigned_to_id: req.params.user_id
	}).success(function (data) {
		console.log(data);
		res.json(data.user.memberships);
	}).error(function (err) {
		console.log(err);
		res.status(404).json(err);
	});
});

// get all issues in a specific project
router.get('/projects/:project_id/issues', function(req, res, next) {
	redmine.get('issues', {
		project_id: req.params.project_id
	}).success(function (data) {
		console.log(data);
		res.json(data);
	}).error(function (err) {
		console.log(err);
		res.status(404).json(err);
	});
});

// get information of specific project
router.get('/projects/:project_id', function(req, res, next) {
	redmine.get('projects/' + req.params.project_id, {
		include: 'trackers,issue_categories,enabled_modules'
	}).success(function (data) {
		console.log(data);
		res.json(data);
	}).error(function (err) {
		console.log(err);
		res.status(404).json(err);
	});
});



module.exports = router;