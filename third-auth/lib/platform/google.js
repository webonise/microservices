var impl = require("./default-impl");
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var logger = require("winston");


module.exports = function(passport,server,config) {
  logger.info("Loading Google authentication into the server");

  passport.use(new GoogleStrategy({
    clientID: config.appId,
    clientSecret: config.appSecret,
    callbackURL: impl.callbackUrl("google")
  }, function(accessToken, refreshToken, profile, done) {
    logger.info("Processing Google login for Google user " + profile.id);
    impl.storeAuth(
      done,
      "google", profile.id,
      profile,
      {accessToken: accessToken, refreshToken: refreshToken}
    )
  }
  ));

  var scopes = config.scopes;
  if(!scopes) scopes = ["openId", "profile"]
  impl.attachPaths("google", server.app, {scope: scopes});
};
