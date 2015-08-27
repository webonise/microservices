var log = require("winston");

log.info("Starting Third Party auth microserver...");
var server = require("./lib/microserver");
server.start();
log.info("Started on port " + server.port + "!");
