'use strict';

/*global describe, it*/

var assert = require('assert');

var fakeObjectId = require('./index');

describe('fakeObjectId', function () {
  it('should have timestamp for id[0, 8]', function () {
    var objectIdTime = fakeObjectId().slice(0, 8);
    var epoch = parseInt(objectIdTime, 16);
    assert.equal(+new Date(epoch), epoch);
  });
  it('should be a string match /[a-f0-9]{24}/g', function () {
    for (var i = 0; i < 512; i++) {
      assert.ok(/[a-f0-9]{24}/g.test(fakeObjectId()));
    }
  });
});
