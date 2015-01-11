var assert = require("assert")
var _ = require("underscore");

// Some experiments on Underscore to see how it works (and to catch it if the behavior changes on upgrade).

describe('_', function(){
  describe('#has', function(){
    it('returns true for null-valued keys', function(){
      expect(_.has({foo:null}, 'foo')).toEqual(true);
    })
  })

  describe("#defaults", function() {
    it("does not override null", function() {
      var obj = _.defaults({foo:null}, {foo:true});
      expect(obj.foo).toBeNull();
    });
  });

})


