/*global module */
module.exports = function (map) {
	'use strict';

	var wallAt = function (point) {
			return map.walls.find(function (wall) {
				return wall.x === point.x && wall.y === point.y;
			});
		},
		enemyAt = function (point) {
			return map.enemies.find(function (tank) {
				return tank.x === point.x && tank.y === point.y;
			});
		},
		movements = {
			top: { x: 0, y: -1 },
			left: { x: -1, y: 0 },
			bottom: {x: 0, y: 1},
			right: {x: 1, y: 0}
		},
		outsideMap = function (point) {
			return point.x < 0 || point.x >= map.mapWidth || point.y < 0 || point.y >= map.mapHeight;
		},
		hasTarget = function (test) {
			var distance, pointAtDistance;
			for (distance = 0; distance < map.weaponRange; distance++) {
				pointAtDistance = { x: tank.x + (distance + 1) * movement.x, y: tank.y + (distance + 1) * movement.y };
				if (pointAtDistance.x < 0 || pointAtDistance.y < 0) {
					continue;
				}
				if (test(pointAtDistance)) {
					return true;
				}
			}
			return false;
		},
		patrolTheCentralCross = function () {

			// Guides the tank trough the "central cross"
			//
			// The reason for choosing this path for patroling is that the fire starts
			// at the map corners and reaches this path at the very end.
			// Turns are clock-wise (rights) in general.
			// While on the path, the behavior of the tank is a Moore FSM. While on
			// other fileds, command selection is delegated to moveToCentralCross().

			var mapHeightMiddle = parseInt(map.mapHeight / 2);
			var mapWidthMiddle = parseInt(map.mapWidth / 2);

			if (tank.x === mapWidthMiddle
			&& tank.y !== mapHeightMiddle
			&& tank.y !== 0
			&& tank.y !== map.mapHeight) {
				switch (tank.direction) {
					case 'bottom': case 'top':
						return forwardOrFire();
					default:
						return 'turn-right'; // Any turn, could prefer going to center instead
				}
			}

			else if (tank.y === mapHeightMiddle
			&& tank.x !== mapWidthMiddle
			&& tank.x !== 0
			&& tank.x !== map.mapWidth) {
				switch (tank.direction) {
					case 'rigt': case 'left':
						return forwardOrFire();
					default:
						return 'turh-right'; // Any turn, could prefer going to center instead
				}
			}

			else if (tank.x === mapWidthMiddle && tank.y === 0) {
				switch (tank.direction) {
					case 'top':
						return 'turn-right';
					case 'right':
						return 'turn-right';
					case 'left':
						return 'turn-left'; // Any turn, but this makes the tank spin less and turn inward more
					case 'bottom':
						return forwardOrFire();
				}
			}

			else if (tank.x === mapWidthMiddle && tank.y === map.mapHeight) {
				switch (tank.direction) {
					case 'top':
						return forwardOrFire();
					case 'right':
						return 'turn-left'; // Any turn, but this makes the tank spin less and turn inward more
					case 'left':
						return 'turn-right';
					case 'bottom':
						return 'turn-right';
				}
			}

			else if (tank.x === 0 && tank.y === mapHeightMiddle) {
				switch (tank.direction) {
					case 'top':
						return 'turn-right';
					case 'right':
						return forwardOrFire();
					case 'left':
						return 'turn-right';
					case 'bottom':
						return 'turn-left'; // Any turn, but this makes the tank spin less and turn inward more
				}
			}

			else if (tank.x === map.mapWidth && tank.y === mapHeightMiddle) {
				switch (tank.direction) {
					case 'top':
						return 'turn-left'; // Any turn, but this makes the tank spin less and turn inward more
					case 'right':
						return 'turn-right';
					case 'left':
						return forwardOrFire();
					case 'bottom':
						return 'turn-right';
				}
			}

			else if (tank.x === mapWidthMiddle && tank.y === mapHeightMiddle) {
				return forwardOrFire();
			}

			return moveToCentralCross();
		},
		forwardOrFire = function () {
			if (wallAt(nextField)) {
				return 'fire';
			}
			return 'forward';
		},
		moveToCentralCross = function () {
			return getShortestWayToCentralCross()[0];
		},
		getShortestWayToCentralCross = function () {

			// Returns shortest array of commands neccessary to reach the "central cross"

			var closestTwoArms = getClosestTwoArmsOfCentralCross();
			var commands = makeRandomPathTo(closestTwoArms);
			var start = process.hrtime();

			var tmpCommands;

			while (timedout(start, 500) || commands.length !== 0) {
				tmpCommands = makeRandomPathTo(closestTwoArms);
				if (tmpCommands.length < commands.length) {
					commands = tmpCommands;
				}
			}

			return commands;
		},
		timedout = function (start, milliseconds) {
			return (process.hrtime(start)[0] * 1000 + process.hrtime(start)[1] / 1000000) > milliseconds;
		},
		getClosestTwoArmsOfCentralCross = function () {
			var mapHeightMiddle = parseInt(map.mapHeight / 2);
			var mapWidthMiddle = parseInt(map.mapWidth / 2);
			var closestTwoArms = [];

			var x;
			var y;

			if (tank.x < mapWidthMiddle) { // Tank in the left half of the map
				// Append left arm
				for (x = 0, y = mapHeightMiddle; x < mapWidthMiddle; ++x) {
					closestTwoArms.push({x: x, y: y});
				}
			}
			else if (tank.x > mapWidthMiddle) { // Tank in the right half of the map
				// Append right arm
				for (x = mapWidthMiddle, y = mapHeightMiddle; x < map.mapWidth; ++x) {
					closestTwoArms.push({x: x, y: y});
				}
			}

			if (tank.y < mapHeightMiddle) { // Tank in the top half of the map
				// Append top arm
				for (x = mapWidthMiddle, y = 0; y < mapHeightMiddle; ++y) {
					closestTwoArms.push({x: x, y: y})
				}
			}

			else if (tank.y > mapHeightMiddle) { // Tank in the bottom half of the map
				// Append bottom arm
				for (x = mapWidthMiddle, y = mapHeightMiddle; y < map.mapHeight; ++y) {
					closestTwoArms.push({x: x, y: y})
				}
			}

			return closestTwoArms;
		},
		getClosestTwoBulletTrajectories = function (target) {
			var closestTrajectories = [];

			var x;
			var y;

			if (tank.x < target.x) { // Tank on the left of the target
				for (x = 0, y = target.y; x < target.x; ++x) {
					closestTrajectories.push({x: x, y: y});
				}
			}
			else if (tank.x > target.x) { // Tank on the right of the target
				for (x = target.x, y = target.y; x < map.mapWidth; ++x) {
					closestTrajectories.push({x: x, y: y});
				}
			}

			if (tank.y < target.y) { // Tank above the target
				for (x = taret.x, y = 0; y < target.y; ++y) {
					closestTrajectories.push({x: x, y: y})
				}
			}

			else if (tank.y > target.y) { // Tank below the target
				for (x = target.x, y = target.y; y < map.mapHeight; ++y) {
					closestTrajectories.push({x: x, y: y})
				}
			}

			return closestTrajectories;
		},
		makeRandomPathTo = function (points) {
			var end = pickRandomElement(points);
			var current = {x: tank.x, y: tank.y, direction: tank.direction};
			var path = [];

			var advancementAxis;
			var advancement;
			var advancementDirection;
			var turns;
			var shots;

			while (current.x !== end.x && current.y !== end.y) {
				advancementAxis = pickAdvancementAxis(current, end);
				advancement =  Math.sign(end[advancementAxis] - current[advancementAxis]);
				advancementDirection = getAdvancementDirection(advancementAxis, advancement);
				turns = getTurns(current.direction, advancementDirection);
				path.push(...turns);
				current[advancementAxis] += Math.sign(end[advancementAxis] - current[advancementAxis]);
				current.direction = advancementDirection;
				shots = getShots(current);
				path.push(...shots);
				path.push('forward');
			}

			return path;
		},
		getAdvancementDirection = function (advancementAxis, advancement) {
			if (advancementAxis === 'x') {
				return advancement < 0 ? 'left' : 'right';
			}

			return advancement < 0 ? 'top' : 'botton';
		},
		getTurns = function (from, to) {
			if (from === to) {
				return [];
			}
			if ((from === 'top' && from === 'bottom')
			|| (from === 'bottom' && to === 'top')
			|| (from === 'left' && to === 'right')
			|| (from === 'right' && to === 'left')) {
				return ['turn-right', 'turn-right'];
			}
			if ((from === 'top' && to === 'right')
			|| (from === 'right' && to === 'bottom')
			|| (from === 'bottom' && to === 'right')
			|| (from === 'right' && to === 'top')) {
				return ['turn-right'];
			}
			return ['turn-left'];
		},
		getShots = function (point) {
			var wall = wallAt(point);
			var numberOfShots;

			if (wall === undefined) {
				return [];
			}

			numberOfShots = Math.ceil(wall.strength / map.weaponDamage);
			return Array(numberOfShots).fill('fire');
		},
		getSurroundingPoints = function (center) {
			var surroundingPoints = [];

			if (center.x - 1 >= 0) {
				surroundingPoints.push({x: center.x - 1, y: center.y});
			}

			if (center.x + 1 < map.mapWidth) {
				surroundingPoints.push({x: center.x + 1, y: center.y});
			}

			if (center.y - 1 >= 0) {
				surroundingPoints.push({x: center.x, y: center.y - 1});
			}

			if (center.y + 1 < map.mapHeight) {
				surroundingPoints.push({x: center.x, y: center.y + 1});
			}

			return surroundingPoints;
		},
		pickAdvancementAxis = function (from, to) {
			if (from.x !== to.x && from.y !== to.y) {
				return pickRandomElement(["x", "y"]);
			}
			return (from.x !== to.x) ? "x" : "y";
		},
		pickRandomElement = function (arr) {
			return arr[Math.floor(Math.random() * arr.length)];
		},
		killEnemy = function () {
			var enemyWithRelativePosition;

			if (hasTarget(enemyAt)) {
				return 'fire';
			}

			if ((enemyWithRelativePosition = getAlignedEnemy())) {
				return rotateTowards(enemyWithRelativePosition.relativePosition);
			}

			return getShortestPathToAimAtTarget()[0];
		},
		getAlignedEnemy = function () {
			var bulletTrajectories = [];
			var limitX = Math.min(map.mapWidt - 1, tank.x + map.weaponRange);
			var limitY = Math.min(map.mapHeight - 1, tank.y + map.weaponRange);

			var x;
			var y;
			var i;
			var enemy;

			for (x = Math.max(0, tank.x - map.weaponRange), y = tank.y; x < tank.x; ++x) {
				bulletTrajectories.push({x: x, y: y, relativePosition: 'left'});
			}

			for (x = Math.min(map.mapWidht - 1, tank.x + 1), y = tank.y; x <= limitX; ++x) {
				bulletTrajectories.push({x: x, y: y, relativePosition: 'right'});
			}

			for (x = tank.x, y = Max(0, tank.y - map.weaponRange); y < tank.y; ++y) {
				bulletTrajectories.push({x: x, y: y, relativePosition: 'top'});
			}

			for (x = tank.x, y = Min(map.mapHeight - 1, tank.y + 1); y <= limitY; ++y) {
				bulletTrajectories.push({x: x, y: y, relativePosition: 'bottom'});
			}

			for (i = 0; i < bulletTrajectories.length; ++i) {
				enemy = enemyAt(bulletTrajectories[i]);
				if (enemy) {
					enemy.relativePosition = bulletTrajectories[i].relativePosition;
					return enemy;
				}
			}

			return undefined;
		},
		rotateTowards = function (relativePosition) {
			if (tank.direction === relativePosition) {
				return 'pass';
			}

			if ((tank.direction === 'bottom' && relativePosition === 'right')
			|| (tank.direction === 'right' && relativePosition === 'top')
			|| (tank.direction === 'top' && relativePosition === 'left')
			|| (tank.direction === 'left' && relativePosition === 'bottom')) {
				return 'turn-left';
			}

			return 'turn-right';
		},
		getShortestPathToAimAtTarget = function (target) {

			// Returns shortest array of commands necessary to aim on the target

			var closestTrajectories = getClosestTwoBulletTrajectories();
			var commands = makeRandomPathTo(closestTrajectories);
			var start = process.hrtime();

			var tmpCommands;

			while (timedout(start, 500) || commands.length !== 0) {
				tmpCommands = makeRandomPathTo();
				if (tmpCommands.length < commands.length) {
					commands = tmpCommands;
				}
			}

			return commands;
		},
		enemyIsOnRadar = function () {
			return undefined !== map.enemies.find(function (tank) {
				return tank.x !== undefined;
			});
		},
		tank = map.you,
		movement = movements[tank.direction],
		nextField = { x: tank.x + movement.x, y: tank.y + movement.y };

	console.log(map);

	if (enemyIsOnRadar()) {
		return killEnemy();
	}

	return patrolTheCentralCross();
};
