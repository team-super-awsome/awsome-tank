import test from 'ava';

var assert = require('chai').assert;

test('will fire at wall at next field', function (t) {
  var map = require('./fixtures/wallAtNextField');
  var tankAI = require('../tank.js');
  t.is(tankAI(map), 'fire');
});

test('will patroll the central cross immediately', function (t) {
  var map = require('./fixtures/onTheCentralCross');
  var tankAI = require('../tank.js');
  t.is(tankAI(map), 'forward');
  map.you.y = 0;
  t.is(tankAI(map), 'turn-right');
  map.you.direction = 'right';
  t.is(tankAI(map), 'turn-right');
  map.you.direction = 'bottom';
  t.is(tankAI(map), 'forward');
});

test('will search its way to central cross', function (t) {
  var map = require('./fixtures/closeToCentralCross');
  var tankAI = require('../tank.js');
  assert.include([
    'turn-left', 'turn-right', 'forward'
  ], tankAI(map));
});
