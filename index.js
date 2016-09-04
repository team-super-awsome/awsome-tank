/* global require, module */

var API = require('claudia-api-builder'),
	tankAI = require('./tank.js'),
	api = new API();

module.exports = api;

api.get('/info', function () {
	'use strict';
	return {
		name: 'Our Super Awsome Tank',
		owner: 'Team Super Awsome'
	};
});
api.post('/command', function (request) {
	'use strict';
	var map = request.body;
	return {
		command: tankAI(map)
	};
});
