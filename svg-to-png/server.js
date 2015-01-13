var MicroServer = require("microserver");
var svg_to_png = require("svg-to-png");
var fs = require("fs");
var os = require("os");
var path = require("path");
var config = require("configise");
var logger = config.logger || require("winston");
var Promise = require("bluebird");
var _ = require("underscore");

Promise.promisifyAll(fs);

var wkdirId = 0;
function convert(fileName, cb) {
  var subdir = server.tmpSubdir("svg-" + wkdirId);
  return Promise.resolve(svg_to_png.convert(fileName, subdir)).then(function(outdir) {
    return [outdir, fs.readdirAsync(outdir)];
  }).spread(function(outdir, files) {
    return path.join(outdir, files[0]);
  }).then(cb);
}

function convertHandler(req,res) {
  logger.info("Processing request");

  if(!req.files || _.isEmpty(req.files)) {
    logger.warn("No multipart files found", {files: req.files, params: req.params});
    res.sendStatus(400, "Please send a file as a multipart/form-upload");
    return;
  }

  if(!req.files.file) {
    logger.warn("No 'file' parameter found");
    res.sendStatus(400, "Please send the file as the 'file' parameter in the multipart/form-upload");
    return;
  }

  return convert(req.files.file.path, function(outputFileName) {
    logger.info("Conversion complete: " + outputFileName);
    var sendFile = Promise.promisify(res.sendFile, res);
    return sendFile(outputFileName);
  }).catch(function(err) {
    logger.warn("Could not process result", err);
    res.sendStatus(500, err.message);
  });
}

var server = new MicroServer({
  mountpoint: "/convert",
  handler: convertHandler,
  multerOpts: {
    buffer: true
  }
});
server.start();

logger.info("Started!");

if(module && module.exports) module.exports = server;
