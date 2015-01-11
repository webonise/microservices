// Exploratory testing for how JS's prototyping works

describe("Object.prototype", function() {

  it("does not impact field resolution after the object is created", function() {
    var bar = {
      baz: true
    };

    function Foo() {
      this.prototype = bar;
    }

    var foo = new Foo();

    expect(foo.baz).not.toEqual(bar.baz);
    expect(foo.baz).toBeUndefined();
  });

});

describe("Object.__proto__", function() {

  it("exists in Node", function() {
    expect({}.__proto__).not.toBeUndefined();
  });

  it("does impact field resolution even after the object is created", function() {
    var bar = { baz: true };

    function Foo() {
      this.__proto__ = bar;
    }

    var foo = new Foo();

    expect(foo.baz).toEqual(bar.baz);
  });

});
