var Microserver = require("../module");
var express = require("express");
var _ = require("underscore");
var frisby = require("frisby");
var os = require("os");

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

});
