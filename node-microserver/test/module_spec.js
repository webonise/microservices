var Microserver = require("../module");
var express = require("express");
var _ = require("underscore");

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
        fixture.stop(done);
      } else {
        done();
      }
    });

    it("can be started", function(done) {
      fixture.start(done);
    });

    it("can be stopped", function(done) {
      fixture.start(function() {
        console.log("Started the server...");
        fixture.stop(function() {
          console.log("Stopping the server...");
          fixture = null;
          done();
          console.log("Stopped the server and called done...");
        });
      });
    });

    it("can be restarted", function(done) {
      fixture.start(function() {
        fixture.stop(function() {
          fixture.start(done);
        });
      });
    }, 200);

  });

});
