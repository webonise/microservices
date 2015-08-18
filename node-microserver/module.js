// Imports
var express = require("express");
var multer  = require('multer');
var _ = require("lodash");
var os = require("os");
var assert = require("assert");
var Promise = require("bluebird");
var path = require("path");
var fs = require("fs");
var config = require("configise");

// I don't like mangling the "fs" namespace.
var openAsync = Promise.promisify(fs.open, fs);
var closeAsync = Promise.promisify(fs.close, fs);
var unlinkAsync = Promise.promisify(fs.unlink, fs);

// Track the files to delete here
// In a previous implementation, we had a handler per file to delete, but Node complained.
var deleteOnExit = (function() {
  var deleteMe = [];
  process.on('exit', function() {
    _(deleteMe).each(function(tmpDir) {
      try {
        fs.unlinkSync(tmpDir);
      } catch(ignored) {}
    });
  });
  return _.memoize(function(fileToDelete) {
    deleteMe.push(fileToDelete);
  });
})();

var serverCounter = 0;

var clazz = module.exports = function MicroServer(opts) {
  var my = this;
  var serverId = ++serverCounter;

  if (!(this instanceof arguments.callee)) {
    throw new Error("You forgot to use 'new' to instantiate the MicroServer");
  }

  // Get the configuration options in place
  _(_.defaults(opts || {}, {
    port: 9876,
    handler: function defaultHandler(req, res) {
      return res.status(501).json({working:true});
    },
    mountpoint: "/service",
    verb: 'all',
    serverId: serverId,
    multerOpts: undefined
  })).each(function(value, key) {
    my[key] = value;
  });

  // Inheritance just wasn't working here.
  // TODO Get inheritance working.
  // When it does work, do this.app = this;
  this.app = express();
  this.app.use(multer(this.multerOpts));

  // attach the configuration
  this.config = config;

  //
  // tmpDir and temp file stuff
  //

  var EEXIST_ERROR_CODE = "EEXIST";

  function mkSubdir(parentDir, subDir) {
    var dir = path.join(parentDir, subDir);
    try {
      fs.mkdirSync(dir);
    } catch(e) {
      // May already exist; that's fine.
      if(e.code != EEXIST_ERROR_CODE) {
        throw e;
      }
    }
    return dir;
  }

  function generateTmpDir() {
    var tmpDir = os.tmpdir();
    _([process.title, process.pid.toString() + "-" + serverId.toString()]).each(function(subdir) {
      tmpDir = mkSubdir(tmpDir, subdir);
    });
    deleteOnExit(tmpDir);
    return tmpDir;
  }

  this.tmpDir = generateTmpDir();
  this.tmpSubdir = function(subdir) {
    var dir = mkSubdir(this.tmpDir, subdir);
    deleteOnExit(dir);
    return dir;
  };

  var fileId = 0;
  function tempFileDisposer(me, filename, suffix, wantFileDescriptor) {
    assert.ok(me.tmpDir); // Ensures that we have a tmpDir
    filename = filename || "temp";
    suffix = suffix || "tmp";
    var fileName = filename + "_" + (fileId++).toString() + "." + suffix;
    var filePath = path.join(me.tmpDir, fileName);
    return openAsync(filePath, "wx+").then(function(fd) {
      return [fd,filePath];
    }).disposer(function(fdAndFilePath) {
      var fd = fdAndFilePath[0];
      var filePath = fdAndFilePath[1];
      closeAsync(fd).then(unlinkAsync.bind(null, filePath));
    });
  }

  // Callback is passed two arguments: first, the fd (which should be preferred); second, the file path.
  this.withTempFile = function(filename, suffix, cb) {
    return Promise.using(tempFileDisposer(this, filename, suffix), function(fdAndFilePath) {
       return Promise.resolve(cb(fdAndFilePath[0], fdAndFilePath[1]));
    });
  };

  //
  // Attach new methods
  //

  this.start = function startMicroServer(cb) {
    if(this.server) {
      throw new Error("Server is already started; please call #stop to stop it");
    }
    var app = this.app;
    var port = this.port;
    var me = this;
    var server = app.listen(port, function() {
      assert.ok(server);
      me.server = server;
      if(cb) cb();
    });
    return server;
  };

  this.stop = function stopMicroServer(cb) {
    if(!this.server) return;
    var me = this;
    this.server.close(function() {
      me.server = null;
      if(cb) cb();
    });
  };

  this.healthCheck = function microServerHealthCheck() {
    var loadavg = os.loadavg();
    var cpus = os.cpus();
    var cpuCount = _.size(cpus);

    return {
      load: {
        "1min": (loadavg['0'])/cpuCount,
        "5min": (loadavg['1'])/cpuCount,
        "15min": (loadavg['2'])/cpuCount
      },
      cpus: cpus,
      uptime: process.uptime(),
      memory: {
        free: os.freemem(),
        total: os.totalmem(),
        load: (os.freemem() * 1.0) / os.totalmem(),
        process: process.memoryUsage().rss
      }
    };
  };

  this.ping = function microServerPing() {
    return { pong: true };
  };


  //
  // Routing
  //

  // Register the Handler unless it is null
  if(!_.isNull(this.handler)) {
    // Use a delegate so that changes to the handler are detected
    var middleware = function handlerDelegate(req,res) {
      return my.handler(req,res);
    };
    assert.ok(this.verb);
    assert.ok(this.mountpoint);
    this.app[this.verb](this.mountpoint, middleware);
  }

  // Register the health check
  this.app.get("/health", function(req,res) {
    return res.json(my.healthCheck());
  });

  // Register the ping
  this.app.get("/ping", function(req,res) {
    return res.json(my.ping());
  });
};
