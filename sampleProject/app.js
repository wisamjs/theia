
var apiRouter = require('./lib/api-router');
var bodyParser = require('body-parser');
var express = require('express');
var winston = require('winston');
var cookiesParser = require('cookie-parser');
var expressWinston = require('express-winston');
var config = require('config');
var app = express();
//CORS support
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header('Access-Control-Allow-Methods','GET, POST, PUT, OPTIONS, DELETE');
  next();
});
app.use(expressWinston.logger(
{
  transports: [ new winston.transports.Console({ json: false, colorize: false}) ],
  meta: false,
  expressFormat: true,
  colorStatus: false
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookiesParser());

var port = process.env.PORT || config.port || 8080;



app.use('/api', apiRouter);
app.use(function(err, req, res, next){
  winston.error(err.stack);
  res.status(500).send('Something broke!' + err ).end();
});
var server = app.listen(port);
winston.info('-------------------------------');
winston.info('server is running on port: ' + port + ' in ' + (process.env.NODE_ENV || 'default'  )+ ' config');

var gracefulShutdown = function() {
  winston.info('Received kill signal, shutting down gracefully.');

  server.close(function() {process.exit(0);});
  setTimeout(function() {
    winston.error('Could not close connections in time, forcefully shutting down');
    process.exit(0);
  }, 1000);
};

// listen for TERM signal .e.g. kill
process.on ('SIGTERM', gracefulShutdown);
// listen for INT signal e.g. Ctrl-C
process.on ('SIGINT', gracefulShutdown);
