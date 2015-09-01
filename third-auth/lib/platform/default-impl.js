var redis = require("../redis");
var nodeUuid = require("node-uuid");
var Promise = require("bluebird");
var log = require("winston");
var passport = require("passport");
var config = require("configise");

var func = module.exports = {};
func.storeAuth = function storeAuth(done, platform, platformId, profile, auth) {
  log.info("Storing authentication for " + platform + " user " + platformId);
  Promise.all([
    redis.createToken(platform, platformId),
    redis.storeAuth(platform, platformId, auth),
    redis.storeProfile(platform, platformId, profile)
  ]).spread(function(uuid, ignoreEverythingElse) {
    done(null, uuid);
  }).catch(function(err) {
    log.warn("Could not store user from " + platform + ": " + err);
    done(err);
  });
};

func.attachPaths = function attachPaths(platform, app, calloutArguments, passportKey) {
  passportKey = passportKey || platform;
  calloutArguments = calloutArguments || {};
  calloutArguments.session = false;
  app.get("/auth/" + platform, passport.authenticate(passportKey, calloutArguments));
  app.get("/auth/" + platform + "/callback", passport.authenticate(passportKey, {session: false}),
    function authenticationSuccess(req, res) {
      var uuid = req.user;
      res.redirect("/exit?authToken=" + uuid);
    }
  );
};

func.callbackUrl = function callbackUrl(platform) {
  return config.baseUrl + "/auth/" + platform + "/callback";
};
