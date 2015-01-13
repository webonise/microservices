var MicroServer = require("microserver");
var svg_to_png = require("svg-to-png");
var fs = require("fs");
var os = require("os");
var path = require("path");
var config = require("configise");
var logger = config.logger || require("winston");
var Promise = require("bluebird");

function convert(bytesOrFileName, cb) {
  var prefix = typeof bytesOrFileName == "string" ? bytesOrFileName : "svg-file";
  return server.withTempFile(prefix, "png", function(fd, fileName) {
    return Promise.resolve(svg_to_png.convert(bytesOrFileName, fileName)).return(fileName).then(cb);
  });
}

function convertHandler(req,res) {
  res.sendStatus(200);
}

var server = new MicroServer({
  mountpoint: "/convert",
  handler: convertHandler
});
server.start();

logger.info("Started!");

if(module && module.exports) module.exports = server;
