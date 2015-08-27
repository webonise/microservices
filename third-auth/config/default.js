module.exports = {
  baseUrl: "http://localhost:9876",
  platforms: ["sample", "twitter"],
  sample: { awesome: true },
  cookieSecret: "third-auth-ftw",
  twitter: require("./twitter"),
  redisSession: {
    host: "127.0.0.1",
    port: 6379,
    db: 1
  }
};
