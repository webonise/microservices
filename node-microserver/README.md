Node Microserver
=================

This is an `npm` package that provides the base functionality for microservers.

This spins up an Express app instance.

Installation
===============

```bash
npm install --save microserver
```

Usage
======

```javascript
var MicroServer = require("microserver");
var myService = new MicroServer({ // Argument is optional; defaults are given below
  port: 9876   // What port to listen in on
  handler: function(req,res) { res.status(501).json({working:true}); }, // Express middleware
  mountpoint: "/service", // The endpoint where to mount the handler
  verb: 'all' // Which HTTP method(s) to support: see http://expressjs.com/api.html#app.METHOD
});
myService.app // The Express app, for all your customization needs
myService.start();
myService.stop();
```

If you don't want the `handler` to be installed at `mountpoint` for the verb given in `verb`, then
pass `null` in as `handler`.

There is an [Express app](http://expressjs.com/api.html#application) on the `app` property of
`myService`. Once you call `myService.start()`, you can also get a handle on the server under
the `server` property.

If you want to stop the server, call `myService.

Note
-----

This class would inherit from

Provided Functionality
=======================

Aside from making your code much more concise and readable, this class also provides some useful
utility methods for monitoring the microservice.

GET /health
-------------

Provides information derived from `os` and `process` modules. If you want to customize/override the
information provided, then override the `healthCheck` method: the response from `/health` is the JSON
of the return value from the `healthCheck` method.

The default implementation provides a few fields:

* *load* -- The average CPU load on the server, provided in the fields *1min*, *5min*, and *15min*
for the last 1 minute, 5 minutes, and 15 minutes. These values come from `os.loadavg()`, except they
are scaled by CPU count, so they are always between 0 and 1.
* *cpus* -- The count of CPUs.
* *uptime* -- The time (in seconds) that the process has been up.
* *memory* -- The memory profile of the system. The fields are *free* (free memory on the system),
*total* (total memory on the system), *load* (free memory divided by total memory), and *process*
(the resident memory set size of the process).

In addition to the diagnostic information, this also can work as a rudimentary performance check,
since it does make some basic system calls.

GET /ping
-----------

Simply returns `{pong:true}`. If you want to customize that value, override the `ping` method: the
response from `/ping` is the JSON of the return value from the `ping` method. This is intended as
an absolute minimal check of performance.