// If you want to enhance the Jasmine execution context, just add into this file.

require("UnderscoreMatchersForJasmine");

_ = require("underscore");

// Common code for routing promises into the "done" callback model.
module.exports = {
  promiseDone: function(testBodyCb) {
    return function(done) {
      done = _.once(done);
      return testBodyCb().catch(done).finally(function() { done(); });
    };
  }
};
