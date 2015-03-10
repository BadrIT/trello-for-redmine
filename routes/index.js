var express = require('express'),
	router = express.Router(),
	index = "index.html";

/* GET home page. */
router.get('/', function(req, res, next) {
	res.sendFile(index, { root: __dirname + "/../public/views/" });
});

router.get('/trello/:project_id', function(req, res, next) {
	res.sendFile(index, { root: __dirname + "/../public/views/" });
});


router.get('/login', function(req, res, next) {
	res.sendFile(index, { root: __dirname + "/../public/views/" });
});

module.exports = router;
