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
  verb: 'all', // Which HTTP method(s) to support: see http://expressjs.com/api.html#app.METHOD
  multerOpts: undefined // File upload control -- see https://github.com/expressjs/multer
});
myService.app // The Express app, for all your customization needs
myService.start();
myService.server // The HTTP server, which exists between "start" and "stop".
myService.stop();
```

If you don't want the `handler` to be installed at `mountpoint` for the verb given in `verb`, then
pass `null` in as `handler`.

There is an [Express app](http://expressjs.com/api.html#application) on the `app` property of
`myService`. Once you call `myService.start()`, you can also get a handle on the server under
the `server` property.

The Express app ships with the following bits of middleware installed:

* [multer](https://github.com/expressjs/multer) to support multipart file uploads

Configuration Support
-----------------------

The server will use [`Configise`](http://github.com/webonise/configise) for configuration. The loaded configuration
is available under the `myService.config` property.

Temporary File Support
-------------------------

The server has its own temporary directory named under the `myService.tmpDir` property. The server will
create its temporary files there. If you want its temporary files to go somewhere else, assign this property.
However, if you reassign this property, you are taking responsibility for ensuring that the directory exists
and cleaning up the directory when done. (The server will provide and clean up the default directory for you.)

If you want to create a subdirectory in the temp dir, use `myService.tmpSubdir('my-subdir')`. This will create
a folder named 'my-subdir' within the temporary directory folder. Currently, only one layer of temporary
directories are allowed.

If you want access to a file, call `myService.withTempFie(prefix, suffix, cb)`. The final argument (`cb`) is
a callback that will get two arguments: the temporary file descriptor and then the path to the temporary file.
The callback is expected to return a value, a Promise, or a Thenable (see
the [Bluebird API for `resolve`](https://github.com/petkaantonov/bluebird/blob/master/API.md#promiseresolvedynamic-value---promise)).
When that resolves, the temporary file will be deleted.

```javascript
Promise.promisifyAll(fs);

myService.withTempFile("foo", null, function(fd, filePath) {
  var buffer = new Buffer("Hello, World!");
  return fd.writeAsync(fd, buffer, 0, buffer.length, null).tap(function() {
    console.log("Wrote the buffer out to " + filePath + " => " + fs.readFileSync(filePath));
  });
});
```

For More Details
----------------

See the tests under `./test`.

Note
-----

This class would inherit from the Express Application class, enabling you to manipulate the express app
without having to do `.app`, except there is no such class. Our hacky efforts based on manipulating
`__proto__` or `prototype` have proved fruitless, but we would welcome a pull request.

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

TODO
======

* Add logging.
* Add the ability to do HTTP BASIC auth with a username/password stored in Configise.
* Add a body parser for JSON
