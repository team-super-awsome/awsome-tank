import test from 'ava';

var assert = require('chai').assert;
var tankAI = require('../tank');

test('will fire at wall at next field', function (t) {
  var map = require('./fixtures/wallAtNextField');
  t.is(tankAI(map), 'fire');
});

test('will patroll the central cross immediately', function (t) {
  var map = require('./fixtures/onTheCentralCross');
  t.is(tankAI(map), 'forward');
  map.you.y = 0;
  t.is(tankAI(map), 'turn-right');
  map.you.direction = 'right';
  t.is(tankAI(map), 'turn-right');
  map.you.direction = 'bottom';
  t.is(tankAI(map), 'forward');
});

test('will turn right at the bottom tip of the central cross', function (t) {
  var map = require('./fixtures/atTheBottomTip');
  t.is(tankAI(map), 'turn-right');
});

test('will search its way to central cross', function (t) {
  var map = require('./fixtures/closeToCentralCross');
  assert.include([
    'turn-left', 'turn-right', 'forward'
  ], tankAI(map));
});

test('bug #1, send command', function (t) {
  var map = require('./fixtures/bug#1');
  assert.isString(tankAI(map));
});

test('bug #2, no need to pass', function (t) {
  var map = require('./fixtures/bug#2');
  t.not(tankAI(map), 'pass');
});

test('bug #3, stay on track', function (t) {
  var map = require('./fixtures/bug#3');
  t.is(tankAI(map), 'forward');
});
