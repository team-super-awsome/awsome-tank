var libarray = require('./libarray');

var libmap = {

  setMap: function (map) {
    this.map = map;
    this.tank = map.you;
  },

  nextField: function () {
    return { x: this.tank.x + this.movement().x, y: this.tank.y + this.movement().y };
  },

  movement: function () {
    return {
  		top: { x: 0, y: -1 },
  		left: { x: -1, y: 0 },
  		bottom: {x: 0, y: 1},
  		right: {x: 1, y: 0}
  	}[this.tank.direction];
  },

  outsideMap: function (point) {
		return point.x < 0 || point.x >= this.map.mapWidth || point.y < 0 || point.y >= this.map.mapHeight;
	},

  hasTarget: function (test) {
    var distance, pointAtDistance;
    for (distance = 0; distance < this.map.weaponRange; distance++) {
      pointAtDistance = { x: this.tank.x + (distance + 1) * this.movement().x, y: this.tank.y + (distance + 1) * this.movement().y };
      if (pointAtDistance.x < 0 || pointAtDistance.y < 0) {
        continue;
      }
      if (test(pointAtDistance)) {
        return true;
      }
    }
    return false;
  },

  enemyOnRadar: function () {
    return this.map.enemies.find(function (tank) {
      return tank.x !== undefined;
    });
  },

  makeRandomPathTo: function (points) {
    var end = libarray.pickRandomElement(points);
    var current = {x: this.tank.x, y: this.tank.y, direction: this.tank.direction};
    var path = [];

    var advancementAxis;
    var advancement;
    var advancementDirection;
    var turns;
    var shots;

    while (current.x !== end.x || current.y !== end.y) {
      advancementAxis = this.pickAdvancementAxis(current, end);
      advancement =  Math.sign(end[advancementAxis] - current[advancementAxis]);
      advancementDirection = this.getAdvancementDirection(advancementAxis, advancement);
      turns = this.getTurns(current.direction, advancementDirection);
      Array.prototype.push.apply(path, turns);
      current[advancementAxis] += advancement;
      current.direction = advancementDirection;
      shots = this.getShots(current);
      Array.prototype.push.apply(path, shots);
      path.push('forward');
    }

    return path;
  },

  pickAdvancementAxis: function (from, to) {
    if (from.x !== to.x && from.y !== to.y) {
      return libarray.pickRandomElement(["x", "y"]);
    }
    return (from.x !== to.x) ? "x" : "y";
  },

  getAdvancementDirection: function (advancementAxis, advancement) {
    if (advancementAxis === 'x') {
      return advancement < 0 ? 'left' : 'right';
    }

    return advancement < 0 ? 'top' : 'bottom';
  },

  getTurns: function (from, to) {
    if (from === to) {
      return [];
    }
    if ((from === 'top' && to === 'bottom')
    || (from === 'bottom' && to === 'top')
    || (from === 'left' && to === 'right')
    || (from === 'right' && to === 'left')) {
      return ['turn-right', 'turn-right'];
    }
    if ((from === 'top' && to === 'right')
    || (from === 'right' && to === 'bottom')
    || (from === 'bottom' && to === 'left')
    || (from === 'left' && to === 'top')) {
      return ['turn-right'];
    }
    return ['turn-left'];
  },

  getShots: function (point) {
    var wall = this.wallAt(point);
    var numberOfShots;

    if (wall === undefined) {
      return [];
    }

    numberOfShots = Math.ceil(wall.strength / this.map.weaponDamage);
    return Array(numberOfShots).fill('fire');
  },

  wallAt: function (point) {
		return this.map.walls.find(function (wall) {
			return wall.x === point.x && wall.y === point.y;
		});
	},

  enemyAt: function (point) {
		return this.map.enemies.find(function (tank) {
			return tank.x === point.x && tank.y === point.y;
		});
	},

  getClosestTwoArmsOfCentralCross: function () {
    var mapHeightMiddle = parseInt(this.map.mapHeight / 2);
    var mapWidthMiddle = parseInt(this.map.mapWidth / 2);
    var closestTwoArms = [];

    var x;
    var y;

    if (this.tank.x < mapWidthMiddle) { // Tank in the left half of the map
      // Append left arm
      for (x = 0, y = mapHeightMiddle; x < mapWidthMiddle; ++x) {
        closestTwoArms.push({x: x, y: y});
      }
    }
    else if (this.tank.x > mapWidthMiddle) { // Tank in the right half of the map
      // Append right arm
      for (x = mapWidthMiddle, y = mapHeightMiddle; x < this.map.mapWidth; ++x) {
        closestTwoArms.push({x: x, y: y});
      }
    }

    if (this.tank.y < mapHeightMiddle) { // Tank in the top half of the map
      // Append top arm
      for (x = mapWidthMiddle, y = 0; y < mapHeightMiddle; ++y) {
        closestTwoArms.push({x: x, y: y})
      }
    }

    else if (this.tank.y > mapHeightMiddle) { // Tank in the bottom half of the map
      // Append bottom arm
      for (x = mapWidthMiddle, y = mapHeightMiddle; y < this.map.mapHeight; ++y) {
        closestTwoArms.push({x: x, y: y})
      }
    }

    return closestTwoArms;
  },

  getClosestTwoBulletTrajectories: function (target) {
    var closestTrajectories = [];

    var x;
    var y;

    if (this.tank.x < target.x) { // Tank on the left of the target
      for (x = 0, y = target.y; x < target.x; ++x) {
        closestTrajectories.push({x: x, y: y});
      }
    }
    else if (this.tank.x > target.x) { // Tank on the right of the target
      for (x = target.x, y = target.y; x < this.map.mapWidth; ++x) {
        closestTrajectories.push({x: x, y: y});
      }
    }

    if (this.tank.y < target.y) { // Tank above the target
      for (x = target.x, y = 0; y < target.y; ++y) {
        closestTrajectories.push({x: x, y: y})
      }
    }

    else if (this.tank.y > target.y) { // Tank below the target
      for (x = target.x, y = target.y; y < this.map.mapHeight; ++y) {
        closestTrajectories.push({x: x, y: y})
      }
    }

    return closestTrajectories;
  },

  directTo: function (target) {
    var advancementAxis = this.pickAdvancementAxis(this.tank, target);
    var advancement =  Math.sign(target[advancementAxis] - this.tank[advancementAxis]);
    var advancementDirection = this.getAdvancementDirection(advancementAxis, advancement);
    return this.getTurns(this.tank.direction, advancementDirection);
  },

  getShortestWayToCentralCross: function () {

    // Returns shortest array of commands neccessary to reach the "central cross"
    // A simulated annealing heuristic

    var closestTwoArms = this.getClosestTwoArmsOfCentralCross();
    var commands = this.makeRandomPathTo(closestTwoArms);
    var start = process.hrtime();
    var timedout = require('./libtimer').timedout;

    var tmpCommands;

    while (!timedout(start, 500) && commands.length !== 0) {
      tmpCommands = this.makeRandomPathTo(closestTwoArms);
      if (tmpCommands.length < commands.length) {
        commands = tmpCommands;
      }
    }

    return commands;
  },

  getShortestPathToAimAtTarget: function (target) {

    // Returns shortest array of commands necessary to aim on the target
    // A simulated annealing heuristic

    var closestTrajectories = this.getClosestTwoBulletTrajectories(target);
    var commands = this.makeRandomPathTo(closestTrajectories);
    var start = process.hrtime();
    var timedout = require('./libtimer').timedout;

    var tmpCommands;

    while (!timedout(start, 500) && commands.length !== 0) {
      tmpCommands = this.makeRandomPathTo(closestTrajectories);
      if (tmpCommands.length < commands.length) {
        commands = tmpCommands;
      }
    }

    return commands;
  }

};

module.exports = libmap;
