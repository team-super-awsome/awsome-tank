import test from 'ava';

var assert = require('chai').assert;

test('an enemy with position is on radar', function (t) {
  var libmap = require('../libmap');
  libmap.setMap({
    you: {x: 1, y: 2},
    enemies: [{x: 44, y: 21}]
  });
  t.truthy(libmap.enemyOnRadar());
});

test('enemy outside of radar zone not on radar', function (t) {
  var libmap = require('../libmap');
  libmap.setMap({
    you: {x:1, y:2},
    enemies: [{strength: 12}]
  });
  t.falsy(libmap.enemyOnRadar());
});

test('pickRandomElement returns any element from the passed-in array', function (t) {
  var libarray = require('../libarray');
  var arr = [33, 123, 321];
  assert.include(arr, libarray.pickRandomElement(arr));
});

test('pickRandomElement returns the only element from a one element array', function (t) {
  var libarray = require('../libarray');
  var arr = [434];
  t.is(libarray.pickRandomElement(arr), 434);
});

test('pickAdvancementAxis makes sense', function (t) {
  var libmap = require('../libmap');
  libmap.setMap({});
  t.is(libmap.pickAdvancementAxis({x: 13, y: 14}, {x: 13, y: 17}), 'y');
});

test('needed shots make sense', function (t) {
  var libmap = require('../libmap');
  libmap.setMap({
    weaponDamage: 30,
    walls: [{x: 1, y: 3, strength: 130}]
  });
  t.deepEqual(libmap.getShots({x: 1, y: 3}), Array(5).fill('fire'));
});

test('makeRandomPathTo is predictable when little space is available', function (t) {
  var libmap = require('../libmap');
  libmap.setMap({
    you: {x: 0, y: 5, direction: 'left'},
    walls: [{x: 0, y: 7, strength: 110}],
    mapWidth: 1,
    mapHeight: 10,
    weaponDamage: 50
  });
  t.deepEqual(libmap.makeRandomPathTo([{x: 0, y: 9}]), [
    'turn-left', // Turn from left to bottom
    'forward', // Move from y=5 to y=6
    'fire', // Destroy the wall at y=7
    'fire',
    'fire',
    'forward', // Move to y=7
    'forward', // Move to y=8
    'forward' // Move to y=9
  ]);
});

test('makeRandomPathTo will in general make some moves', function (t) {
  var libmap = require('../libmap');
  libmap.setMap({
    you: {x: 50, y: 50, direction: 'bottom'},
    walls: [
      {x: 50, y: 40, strength: 40},
      {x: 49, y: 40, strength: 40},
      {x: 48, y: 40, strength: 40},
      {x: 47, y: 40, strength: 40},
      {x: 46, y: 40, strength: 40},
      {x: 45, y: 40, strength: 40},
      {x: 44, y: 40, strength: 40},
      {x: 43, y: 40, strength: 40},
      {x: 42, y: 40, strength: 40},
      {x: 41, y: 40, strength: 40},
      {x: 40, y: 40, strength: 40},
      {x: 40, y: 41, strength: 40},
      {x: 40, y: 42, strength: 40},
      {x: 40, y: 43, strength: 40},
      {x: 40, y: 45, strength: 40},
      {x: 40, y: 46, strength: 40},
      {x: 40, y: 47, strength: 40},
      {x: 40, y: 48, strength: 40},
      {x: 40, y: 49, strength: 40},
      {x: 40, y: 50, strength: 40},
    ],
    mapWidth: 60,
    mapHeight: 60,
    weaponDamage: 10
  });
  var path = libmap.makeRandomPathTo([{x: 0, y: 0}]);
  var minExpectedPathLength = 1 // for turning from bottom to at least right
    + 50 // commands to move forward by one axis
    + 1 // for turning to the other axis
    + 50 // to travel that other axis
    + 4; // fire commands to break the wall somewhere on the path
  assert.isAtLeast(path.length, minExpectedPathLength);
  t.is(path[path.length - 1], 'forward');
});

test('makeRandomPathTo may turn tank more than once', function (t) {
  var libmap = require('../libmap');
  libmap.setMap({
    mapWidth: 10,
    mapHeight: 10,
    you: {x: 3, y: 4, direction: 'top'},
    walls: []
  });
  t.deepEqual(libmap.makeRandomPathTo([{x: 3, y: 5}]), [
    'turn-right', 'turn-right', 'forward'
  ]);
});

test('getClosestTwoArmsOfCentralCross works for tank in bottom-left quadrant', function (t) {
  var libmap = require('../libmap');
  libmap.setMap({
    mapWidth: 10,
    mapHeight: 10,
    you: {x: 3, y: 7}
  });
  t.deepEqual(libmap.getClosestTwoArmsOfCentralCross(), [
    {x: 0, y: 5},
    {x: 1, y: 5},
    {x: 2, y: 5},
    {x: 3, y: 5},
    {x: 4, y: 5},
    {x: 5, y: 5},
    {x: 5, y: 6},
    {x: 5, y: 7},
    {x: 5, y: 8},
    {x: 5, y: 9}
  ]);
});

test('getClosestTwoBulletTrajectories works for tank in bottom-left quadrant', function (t) {
  var libmap = require('../libmap');
  libmap.setMap({
    mapWidth: 10,
    mapHeight: 10,
    you: {x: 6, y: 7}
  });
  t.deepEqual(libmap.getClosestTwoBulletTrajectories({x: 8, y: 3}), [
    {x: 0, y: 3},
    {x: 1, y: 3},
    {x: 2, y: 3},
    {x: 3, y: 3},
    {x: 4, y: 3},
    {x: 5, y: 3},
    {x: 6, y: 3},
    {x: 7, y: 3},
    {x: 8, y: 3},
    {x: 8, y: 4},
    {x: 8, y: 5},
    {x: 8, y: 6},
    {x: 8, y: 7},
    {x: 8, y: 8},
    {x: 8, y: 9}
  ]);
});

test.cb('libtimer.timedout is comparable to setTimeout', function (t) {
  var start = process.hrtime();
  var timedout = require('../libtimer').timedout;
  t.false(timedout(start, 500));
  setTimeout(function () {
    t.true(timedout(start, 500));
    t.end();
  }, 500);
});

test('getShortestWayToCentralCross returns an array of commands', function (t) {
  var libmap = require('../libmap');
  libmap.setMap({
    mapWidth: 10,
    mapHeight: 10,
    you: {x: 3, y: 4, direction: 'top'},
    walls: []
  });
  assert.includeMembers([
    'turn-left', 'turn-right', 'forward', 'fire', 'reverse', 'pass'
  ], libmap.getShortestWayToCentralCross());
});

test('getShortestPathToAimAtTarget returns an array of commands', function (t) {
  var libmap = require('../libmap');
  libmap.setMap({
    mapWidth: 10,
    mapHeight: 10,
    you: {x: 3, y: 4, direction: 'top'},
    walls: []
  });
  assert.includeMembers([
    'turn-left', 'turn-right', 'forward', 'fire', 'reverse', 'pass'
  ], libmap.getShortestPathToAimAtTarget({x: 6, y: 3}));
});
