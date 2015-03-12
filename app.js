var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var redis = require("redis"),
    redis_client = redis.createClient();
var session = require('cookie-session');

var routes = require('./routes/');
var dashboard = require('./routes/data.js');
var settings = require('./routes/settings');
var redmineConnection = require('./redmine/initConnection');
redmineConnection.init();

var redmine_api = require('./routes/redmine');
var multipart = require('connect-multiparty');
var app = express();


app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(favicon(__dirname + '/public/assets/images/favicon.ico'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ store: redis_client, secret: 'callofduty@badrit.com-2015'}));

app.all('/*', [require('./services/validateRequest')]);

app.use(multipart({
    uploadDir: './uploads/'
}));

app.use('/', routes);
app.use('/dashboard', dashboard);
app.use('/settings', settings);
app.use('/redmine', redmine_api);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});



// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', { 
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
