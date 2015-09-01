module.exports = {
  baseUrl: "http://localhost:9876",
  platforms: ["sample", "twitter", "facebook", "google", "dropbox"],
  sample: { awesome: true },
  cookieSecret: "third-auth-ftw",
  twitter: require("./twitter"),
  facebook: require("./facebook"),
  google: require("./google"),
  dropbox: require("./dropbox"),
  redisSession: {
    host: "127.0.0.1",
    port: 6379
  }
};
