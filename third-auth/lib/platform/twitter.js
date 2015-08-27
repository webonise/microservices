var impl = require("./default-impl");
var TwitterStrategy = require('passport-twitter').Strategy;
var logger = require("winston");


module.exports = function(passport,server,config) {
  logger.info("Loading Twitter authentication into the server");

  passport.use(new TwitterStrategy({
    consumerKey: config.consumerKey,
    consumerSecret: config.consumerSecret,
    callbackURL: impl.callbackUrl("twitter")
  }, function(token, tokenSecret, profile, done) {
    logger.info("Processing Twitter login for Twitter user " + profile.id);
    impl.storeAuth(
      done,
      "twitter", profile.id,
      profile,
      {token: token, tokenSecret: tokenSecret}
    )
  }
  ));

  impl.attachPaths("twitter", server.app);
};
