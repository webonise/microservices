var server = require("../server");
var express = require("express");
var _ = require("underscore");
var frisby = require("frisby");
var os = require("os");
var needle = require("needle");
var Promise = require("bluebird");
var easyimage = require("easyimage");

// Configure Needle to have Promise methods and run promptly
needle.defaults({ timeout: 1000, user_agent: 'Unit-Tests/0.0.0' });
Promise.promisifyAll(needle);

// Disable the server so that we can start and stop it in between runs
describe("SVG to PNG Microserver", function() {

  beforeEach(function(done) {
    done = _.once(done);
    try {
      server.start(done);
    } catch(ignore) {
      done();
    }
  });

  afterEach(function(done) {
    server.stop(done);
  });

  it("should exist", function() {
    expect(server).toBeDefined();
  });

  describe("default APIs", function() {

    var baseUrl = "http://localhost:9876";

    var fixture;

    // Sanity check: rely on microservice npm module to test it
    frisby.create("/ping")
      .get(baseUrl + "/ping")
      .expectStatus(200)
    .toss();

    frisby.create("/health")
      .get(baseUrl + "/health")
      .expectStatus(200)
    .toss();

    // Ensure that we disabled the default handler
    frisby.create("/service")
      .get(baseUrl + "/service")
      .expectStatus(404)
    .toss();

    // The actual conversion code
    describe("/convert", function() {

      it("should convert a sample SVG to PNG", promiseDone(function() {
        var data = {
          file: {
            file: './test/data/Example.svg',
            content_type: 'image/svg+xml'
          }
        };

        return needle.postAsync(baseUrl + "/convert", data, {multipart: true})
          .spread(function(res, body) {
            expect(res.statusCode).toEqual(200);
            expect(res.headers['content-type']).toEqual("image/png");
            return body;
          }) // TODO Validate the body
      }));

    });


  });

});
