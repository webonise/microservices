var impl = require("./default-impl");
var FacebookStrategy = require('passport-facebook').Strategy;
var logger = require("winston");


module.exports = function(passport,server,config) {
  logger.info("Loading Facebook authentication into the server");

  passport.use(new FacebookStrategy({
    clientID: config.appId,
    clientSecret: config.appSecret,
    callbackURL: impl.callbackUrl("facebook")
  }, function(accessToken, refreshToken, profile, done) {
    logger.info("Processing Facebook login for Facebook user " + profile.id);
    impl.storeAuth(
      done,
      "facebook", profile.id,
      profile,
      {accessToken: accessToken, refreshToken: refreshToken}
    )
  }
  ));

  var scopes = config.scopes;
  if(!scopes) scopes = ["public_profile"]
  impl.attachPaths("facebook", server.app, {scope: scopes});
};
