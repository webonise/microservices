/*
* Imports
*/

var MicroServer = require("microserver");
var passport = require("passport");
var _ = require("lodash");
var config = require("configise");
var express = require("../node_modules/microserver/node_modules/express/index.js");
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var session = require("express-session");
var RedisStore = require('connect-redis')(session);

/*
* Declare the server
*/
var server = new MicroServer({ handler: null });


/*
* Initialize the server
*/
var app = server.app;
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(bodyParser.text());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(session({
  name: 'third.auth.sid',
  store: new RedisStore(config.redisSession),
  secret: config.cookieSecret,
  saveUninitialized: false,
  resave: false,
  rolling: false,
  cookie: {
    secure: false
  }
}));
app.use(passport.initialize());
app.use(passport.session());

/*
* Install the relevant strategies and return the server
*/
_.each(config.platforms, function(platformKey) {
  require("./platform/" + platformKey)(passport, server, config[platformKey]);
});

/*
* User serialization
* We shouldn't be using session, but I couldn't get things to work without it!
*/
passport.serializeUser(function(userId, done) {
  done(null, userId);
});
passport.deserializeUser(function(id, done) {
  done(null, id);
});


/*
* Establish the entrance point
*/
app.get("/enter", function(req, res) {
  console.dir(req.query);
  var callbackUrl = req.query.callback;
  var platform = req.query.platform;
  req.session.returnTo = callbackUrl;
  res.redirect("/auth/" + platform);
});

app.get("/exit", function(req, res) {
  var authToken = req.query.authToken;
  var returnTo = req.session.returnTo;
  res.redirect(returnTo + "?authToken=" + authToken);
});

/*
* Export the promise of a server
*/
module.exports = server;
