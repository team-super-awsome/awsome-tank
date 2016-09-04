import test from 'ava';

test('will fire at wall at next field', function (t) {
  var map = require('./fixtures/wallAtNextField.json');
  var tankAI = require('../tank.js');
  t.is(tankAI(map), 'fire');
});

test('will patroll the central cross immediately', function (t) {
  var map = require('./fixtures/onTheCentralCross.json');
  var tankAI = require('../tank.js');
  t.is(tankAI(map), 'forward');
  map.you.y = 0;
  t.is(tankAI(map), 'turn-right');
  map.you.direction = 'right';
  t.is(tankAI(map), 'turn-right');
  map.you.direction = 'bottom';
  t.is(tankAI(map), 'forward');
});

test.skip('will search its way to central cross', function (t) {
  var map = require('./fixtures/closeToCentralCross.json');
  var tankAI = require('../tank.js');
});
