define([
	'fontoxml-operations/operationsManager',

    'text!./sx/operations.json'
], function (
	operationsManager,

	operationsJson
	) {
	'use strict';

	return function install () {
		operationsManager.addOperations(JSON.parse(operationsJson));
	};
});

