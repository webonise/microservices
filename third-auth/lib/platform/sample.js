module.exports = function(passport, server, config) {
  console.log("Is third party auth is awesome? Answer: " + config.awesome);

  server.app.get("/auth/sample", function(req, res) {
    res.redirect("/exit?authToken=nota-auth-just-smpl");
  });

};
