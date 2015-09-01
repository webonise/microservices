module.exports = {
  baseUrl: "http://localhost:9876",
  platforms: ["sample", "twitter", "facebook", "google"],
  sample: { awesome: true },
  cookieSecret: "third-auth-ftw",
  twitter: require("./twitter"),
  facebook: require("./facebook"),
  google: require("./google"),
  redisSession: {
    host: "127.0.0.1",
    port: 6379,
    db: 1
  }
};
