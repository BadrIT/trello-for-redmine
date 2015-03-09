var express = require('express'),
	_ = require('underscore-node'),
	request = require('request'),
	router = express.Router(),
	redis = require("redis"),
    redis_client = redis.createClient();

// list all trackers in redmine
router.get('/trackers/:api_key', function (req, res, next) {
	setApiKey(req.params.api_key);
	redmine.get('trackers', 'json').success(function (data) {
		console.log(data);
		res.json(data);
	}).error(function (err) {
		console.log(err);
		res.status(404).json(err);
	});
});

router.get('/issue_statuses/:api_key', function (req, res, next) {
	setApiKey(req.params.api_key);
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

router.get('/users/current/:api_key', function (req, res, next) {
	setApiKey(req.params.api_key);
	redmine.get('/users/current', 'json').success(function (data) {
		console.log(data);
		res.json(data.user);
	}).error(function (err) {
		console.log(err);
		res.status(404).json(err);
	});
});

// get user info
router.get('/users/:user_id/:api_key', function (req, res, next) {
	setApiKey(req.params.api_key);
	redmine.get('/users/' + req.params.user_id, 'json').success(function (data) {
		console.log(data);
		res.json(data.user);
	}).error(function (err) {
		console.log(err);
		res.status(404).json(err);
	});
});

// get issues of user in a specific project
router.get('/users/:user_id/projects/:project_id/issues/:api_key', function (req, res, next) {
	setApiKey(req.params.api_key);
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
router.get('/users/:user_id/projects/:api_key', function (req, res, next) {
	setApiKey(req.params.api_key);
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
router.get('/users/:user_id/issues/:api_key', function (req, res, next) {
	setApiKey(req.params.api_key);
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
router.get('/projects/:project_id/issues/:api_key', function (req, res, next) {
	setApiKey(req.params.api_key);
	redmine.get('issues', {
		project_id: req.params.project_id,
		status_id: '*'
	}).success(function (data) {
		console.log(data);
		res.json(data);
	}).error(function (err) {
		console.log(err);
		res.status(404).json(err);
	});
});

// get all issues in a specific project
router.get('/projects/:project_id/issues/:parent_id/:api_key', function (req, res, next) {
	setApiKey(req.params.api_key);
	redmine.get('issues', {
		project_id: req.params.project_id,
		parent_issue_id: req.params.parent_id,
		status_id: '*'
	}).success(function (data) {
		console.log(data);
		res.json(data);
	}).error(function (err) {
		console.log(err);
		res.status(404).json(err);
	});
});

// get all issues in a specific project
router.get('/projects/:project_id/userstories/:api_key', function (req, res, next) {
	setApiKey(req.params.api_key);
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
router.get('/projects/:project_id/:api_key', function (req, res, next) {
	setApiKey(req.params.api_key);
	redmine.getProject(req.params.project_id).success(function (data) {
		console.log(data);
		res.json(data);
	}).error(function (err) {
		console.log(err);
		res.status(404).json(err);
	});
});

// update an issue
router.put('/issues/:issue_id/:api_key', function (req, res, next) {
	setApiKey(req.params.api_key);
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
router.post('/create/issue/:api_key', function (req, res, next) {
	setApiKey(req.params.api_key);
	redmine.postIssue(req.body)
	.success(function (data) {
		console.log(data);
		res.json(data);
	}).error(function (err) {
		console.log(err);
		res.status(404).json(err);
	});
});

// delete an issue
router.delete('/issues/:issue_id/:api_key', function (req, res, next) {
	setApiKey(req.params.api_key);
	redmine.deleteIssue(req.params.issue_id)
	.success(function () {
		res.status(200);
	}).error(function (err) {
		console.log(err);
		res.status(404).json(err);
	});
});

// GET project members
router.get('/projects/:project_id/memberships/:api_key', function (req, res, next) {
	setApiKey(req.params.api_key);
	redmine.getProjectMembers(req.params.project_id)
	.success(function (data) {
		console.log(data)
		res.json(data);
	}).error(function (err) {
		console.log(err);
		res.status(404).json(err);
	});
});

router.post('/login/user', function (req, res, next) {
	var data = req.body;
	request("http://" + data.username + ":" + data.password + "@redmine.badrit.com/users/current.json", function (error, response, body) {
  		if (!error && response.statusCode == 200) {
    		
    		console.log(body)

    		var user_data = JSON.parse(body);
    		redis_client.set(user_data.user.api_key, body);
    		setApiKey(user_data.user.api_key);

			redmine.get('users/' + user_data.user.id, {
				include: 'memberships'
			}).success(function (data) {
				var first_project_id = data.user.memberships[0].project.id;
				user_data.first_project_id = first_project_id;
				res.json(user_data);
			}).error(function (err) {
				console.log(err);
				res.status(404).json(err);
			});

  		} else {
  			var err = {"msg" : "unauthorized user"}
  			console.log("unauthorized user")
  			res.status(404).json(err);
  		}
	})
	
});

function setApiKey(key) {
	redmine.setApiKey(key);
};

module.exports = router;