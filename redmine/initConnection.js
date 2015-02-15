var fs = require('fs');
config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
var Redmine = require('promised-redmine');

exports.init = function () {
	console.log('Connecting to Redmine');
	redmine = new Redmine({
		host: config.host,
		apiKey: config.apiKey
	});
}