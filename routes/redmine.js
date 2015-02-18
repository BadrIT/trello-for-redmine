var express = require('express'),
	_ = require('underscore-node'),
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

router.get('/issue_statuses', function (req, res, next) {
	redmine.get('/issue_statuses', 'json').success(function (data) {
		var result = _.map(_.sortBy(data.issue_statuses, function (object){
			return object.id;
		}), function (object){
			return {title: object.name, cards: [], sizeX: 1, sizeY: 2, status_id: object.id, allowed: false};
		});
		console.log(result);
		res.json(result);
	}).error(function (err) {
		console.log(err);
		res.status(404).json(err);		
	});
});

router.get('/users/current', function (req, res, next) {
	redmine.get('/users/current', 'json').success(function (data) {
		console.log(data);
		res.json(data.user);
	}).error(function (err) {
		console.log(err);
		res.status(404).json(err);
	});
});

// get issues of user in a specific project
router.get('/users/:user_id/projects/:project_id/issues', function (req, res, next) {
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
router.get('/users/:user_id/projects', function (req, res, next) {
	redmine.get('users/' + req.params.user_id, {
		include: 'memberships'
	}).success(function (data) {
		console.log(data);
		res.json(data);
	}).error(function (err) {
		console.log(err);
		res.status(404).json(err);
	});
});

// get issues assigned to specific user
router.get('/users/:user_id/issues', function (req, res, next) {
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
router.get('/projects/:project_id/issues', function (req, res, next) {
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

// get all issues in a specific project
router.get('/projects/:project_id/issues/:parent_id', function (req, res, next) {
	redmine.get('issues', {
		project_id: req.params.project_id,
		parent_issue_id: req.params.parent_id
	}).success(function (data) {
		console.log(data);
		res.json(data);
	}).error(function (err) {
		console.log(err);
		res.status(404).json(err);
	});
});

// get all issues in a specific project
router.get('/projects/:project_id/userstories', function (req, res, next) {
	redmine.get('issues', {
		project_id: req.params.project_id,
		tracker_id: '5',
		limit: 100
	}).success(function (data) {
		console.log(data);
		var result = _.groupBy(data.issues, function(obj) {
			return obj.status.id;
		});
		res.json(result);
	}).error(function (err) {
		console.log(err);
		res.status(404).json(err);
	});
});

// get information of specific project
router.get('/projects/:project_id', function (req, res, next) {
	redmine.getProject(req.params.project_id).success(function (data) {
		console.log(data);
		res.json(data);
	}).error(function (err) {
		console.log(err);
		res.status(404).json(err);
	});
});

// update an issue
router.put('/issues/:issue_id', function (req, res, next) {
	redmine.updateIssue(req.params.issue_id, req.body)
	.success(function (data) {
		console.log(data);
		res.json(data);
	}).error(function (err) {
		console.log(err);
		res.status(404).json(err);
	});
});

// create new issue (User Story or Task)
router.post('/create/issue/', function (req, res, next) {
	redmine.postIssue(req.body)
	.success(function (data) {
		console.log(data);
		res.json(data);
	}).error(function (err) {
		console.log(err);
		res.status(404).json(err);
	});
});

module.exports = router;