var Microserver = require("../module");
var express = require("express");
var _ = require("underscore");
_.string = require("underscore.string");
var frisby = require("frisby");
var os = require("os");
var fs = require("fs");
var Promise = require("bluebird");

Promise.promisifyAll(fs);

var startsWith = _.string.startsWith.bind(_.string);
var contains = _.string.contains.bind(_.string);
var endsWith = _.string.endsWith.bind(_.string);

describe("Microserver", function() {

  it("should exist and be a function", function() {
    expect(Microserver).toBeA(Function);
  });

  it("should explode when not called with 'new'", function() {
    expect(Microserver).toThrow();
  });

  describe("newly constructed instance", function() {

    var fixture;

    beforeEach(function() {
      fixture = new Microserver();
    });

    afterEach(function(done) {
      if(fixture) {
        fixture.stop();
        fixture = null;
      }
      done();
    });

    it("can be started", function(done) {
      fixture.start(done);
    });

    it("can be stopped", function(done) {
      fixture.start(function() {
        fixture.stop(function() {
          fixture = null;
          done();
        });
      });
    }, 200);

    it("can be restarted", function(done) {
      fixture.start(function() {
        fixture.stop(function() {
          fixture.start(done);
        });
      });
    }, 200);

  });

  describe("the construction options", function() {

    it("can assign a new handler", function() {
      new Microserver({handler: function(req,res) {}});
    });

  });

  describe("default APIs", function() {

    var baseUrl = "http://localhost:9876";

    var fixture;

    beforeEach(function(done) {
      fixture = new Microserver();
      fixture.start(done);
    });

    afterEach(function(done) {
      fixture.stop(done);
      fixture = null;
    });

    frisby.create("/ping")
      .get(baseUrl + "/ping")
      .expectStatus(200)
      .expectJSON({pong:true})
    .toss();

    frisby.create("/health")
      .get(baseUrl + "/health")
      .expectStatus(200)
      .expectJSONTypes({
        load: {
          "1min": Number,
          "5min": Number,
          "15min": Number
        },
        cpus: Array,
        uptime: Number,
        memory: {
          free: Number,
          total: Number,
          load: Number,
          process: Number
        }
      })
    .toss();

    frisby.create("/service")
      .get(baseUrl + "/service")
      .expectStatus(501)
      .expectJSON({working:true})
    .toss();

  });

  describe("temp fs support", function() {

    var fixture;

    beforeEach(function(done) {
      fixture = new Microserver();
      fixture.start(done);
    });

    afterEach(function(done) {
      fixture.stop(done);
      fixture = null;
    });

    describe("tempDir", function() {

      var tmpDir;

      beforeEach(function() {
        tmpDir  = fixture.tmpDir;
      });

      it("exists", function() {
        expect(tmpDir).toBeDefined();
        expect(fs.existsSync(tmpDir)).toEqual(true);
      });

      it("does not use the system temp dir", function() {
        expect(tmpDir).not.toEqual(os.tmpdir());
      });

      it("is unique per server", function() {
        expect(tmpDir).not.toEqual(new Microserver().tmpDir);
      });

    });

    describe("tempSubdir(subdir)", function() {

      var tmpDir;

      beforeEach(function() {
        tmpDir = fixture.tmpSubdir("foo");
      });

      it("exists", function() {
        expect(tmpDir).toBeDefined();
        expect(fs.existsSync(tmpDir)).toEqual(true);
      });

      it("does not use the system temp dir", function() {
        expect(tmpDir).not.toEqual(os.tmpdir());
      });

      it("does not use the server temp dir", function() {
        expect(tmpDir).not.toEqual(fixture.tmpDir);
      });

      it("is a subdir of the server temp dir", function() {
        expect(startsWith(tmpDir, fixture.tmpDir)).toEqual(true);
      });

    });

    describe("withTempFile", function() {

      it("exists and is a function", function() {
        expect(fixture.withTempFile).toBeDefined();
        expect(fixture.withTempFile).toBeA(Function);
      });

      describe("callback file descriptor", function() {

        it("exists", promiseDone(function() {
          return fixture.withTempFile(null, null, function(fd) {
            expect(fd).toBeDefined();
          });
        }));

        // Closest thing that a typecheck that Node lets us do
        it("can be written to", function(done) {
          fixture.withTempFile(null, null, function(fd) {
            var buffer = new Buffer("foo bar");
            fs.write(fd, buffer, 0, buffer.length, null, done);
          });
        });

      });

      describe("callback file path", function() {

        it("exists", promiseDone(function() {
          return fixture.withTempFile(null, null, function(fd, filePath) {
            expect(filePath).toBeDefined();
            expect(filePath).not.toBeEmpty();
            expect(fs.existsSync(filePath)).toEqual(true);
          });
        }));

        it("takes the prefix", promiseDone(function() {
          return fixture.withTempFile("foo", null, function(fd, filePath) {
            console.log("Prefix check file name: " + filePath);
            // TODO We can do better by deresolving against the tmpdir.
            expect(contains(filePath, "foo_")).toEqual(true);
          });
        }));

        it("ends with the suffix", promiseDone(function() {
          return fixture.withTempFile(null, "foo", function(fd, filePath) {
            console.log("Suffix check file name: " + filePath);
            expect(endsWith(filePath, "foo")).toEqual(true);
          });
        }));

      });

      describe("the demo in the README", function() {

        it("should work", promiseDone(function() {
          return fixture.withTempFile("foo", null, function(fd, filePath) {
            var string = "Hello, World!\n";
            var buffer = new Buffer(string);
            return fs.writeAsync(fd, buffer, 0, buffer.length, null).tap(function() {
              var readBack = fs.readFileSync(filePath, {encoding:"UTF-8"});
              console.log("Wrote the buffer out to " + filePath + " => " + readBack);
              expect(readBack).toEqual(string);
            });
          });
        }));

      });

    });

  });

});
