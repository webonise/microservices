var log = require("winston");
var redis = require("then-redis");
var Promise = require("bluebird");
var config = require("configise");
var redisConfig = config.redis;
var nodeUuid = require("node-uuid");

var func = module.exports = {};

// Provide a managed redis connection, caching just one client
// (Simpler than a pool, but with almost all the advantages.)
// Note that more than one client can be around, if multiple clients
// are active at the same time. But we only cache one *IDLE* client.
var cachedClient = null;
setInterval(function() {  // Don't let a cached idle client get too stale.
  if(cachedClient) {      // (Yes, this will wipe out non-stale clients, too,
    cachedClient.quit();  // if they are unfortunately around when the interval
    cachedClient = null;  // fires. That's an acceptable ineffeciency to avoid
  }                       // bookkeeping since new connections are cheap-ish.)
}, 1000).unref();
var withRedis = func.withRedis = function withRedis(cb) {
  var safeClient = Promise.try(function createClient() {
    var client;
    if(!cachedClient) {
      client = redis.createClient(redisConfig);
    } else {
      client = cachedClient;
      cachedClient = null;
    }
    return client;
  }).disposer(function(client) {
    if(!cachedClient) {
      cachedClient = client;
    } else {
      client.quit();
    }
  });
  return Promise.using(safeClient, cb);
};

function platformKey(platform, platformId) {
  return platform + ":" + platformId;
}

var createToken = func.createToken = function createToken(platform, platformId) {
  var platKey = platformKey(platform, platformId);
  var uuid = nodeUuid.v4({rng: nodeUuid.nodeRNG });
  log.info("Storing user from " + platform + " with id " + platformId + " to UUID " + uuid);
  return withRedis(function applyCreateTokenUuid(client) {
    return client.set(uuid, platKey);
  }).then(function() { return uuid; }).finally(function() {
    log.info("Done storing the user from platform " + platform + " with id " + platformId + " to UUID " + uuid);
  });
};

var storeAuth = func.storeAuth = function storeAuth(platform, platformId, authData) {
  var platKey = platformKey(platform, platformId);
  log.info("Storing auth from " + platform + " with id " + platformId);
  return withRedis(function applyStoreAuth(client) {
    return client.hmset(platKey + ":auth", authData);
  }).finally(function() {
    log.info("Done storing auth from " + platform + " with id " + platformId);
  });
};

var storeProfile = func.storeProfile = function storeProfile(platform, platformId, profileData) {
  var platKey = platformKey(platform, platformId);
  var profileString = JSON.stringify(profileData);
  log.info("Storing profile from " + platform + " with id " + platformId + " => " + profileString);
  return withRedis(function applyStoreProfile(client) {
    return client.set(platKey + ":profile", profileString);
  }).finally(function() {
    log.info("Done storing profile from " + platform + " with id " + platformId);
  });
};
