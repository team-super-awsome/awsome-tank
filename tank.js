/*global module */
module.exports = function (map) {
	'use strict';

	var libmap = require('./libmap'),
		tank = map.you,
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
			if (libmap.wallAt(libmap.nextField())) {
				return 'fire';
			}
			return 'forward';
		},
		moveToCentralCross = function () {
			return libmap.getShortestWayToCentralCross()[0];
		},
		killEnemy = function () {
			var enemyWithRelativePosition;

			if (libmap.hasTarget(enemyAt)) {
				return 'fire';
			}

			if ((enemyWithRelativePosition = libmap.hasAlignedEnemy())) {
				return libmap.changeDirection(enemyWithRelativePosition.relativePosition);
			}

			return libmap.getShortestPathToAimAtTarget()[0];
		};

	libmap.setMap(map);
	console.log(map);

	if (libmap.enemyIsOnRadar()) {
		return killEnemy();
	}

	return patrolTheCentralCross();
};
