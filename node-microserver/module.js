var express = require("express");
var _ = require("underscore");
var os = require("os");
var assert = require("assert");
var Promise = require("bluebird");

var clazz = module.exports = function MicroServer(opts) {
  var my = this;

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
    verb: 'all'
  })).each(function(value, key) {
    my[key] = value;
    assert.ok(my[key], "Failure loading " + key);
  });

  // Inheritance just wasn't working here.
  // TODO Get inheritance working.
  // When it does work, do this.app = this;
  this.app = express();

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
      return this.handler(req,res);
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