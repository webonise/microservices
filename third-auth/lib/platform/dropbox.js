var impl = require("./default-impl");
var Strategy = require('passport-dropbox-oauth2').Strategy;
var logger = require("winston");


module.exports = function(passport,server,config) {
  logger.info("Loading Dropbox authentication into the server");

  passport.use(new Strategy({
    clientID: config.appId,
    clientSecret: config.appSecret,
    callbackURL: impl.callbackUrl("dropbox")
  }, function(accessToken, refreshToken, profile, done) {
    logger.info("Processing Dropbox login for Dropbox user " + profile.id);
    impl.storeAuth(
      done,
      "dropbox", profile.id,
      profile,
      {accessToken: accessToken, refreshToken: refreshToken}
    )
  }
  ));

  impl.attachPaths("dropbox", server.app, {}, "dropbox-oauth2");
};
