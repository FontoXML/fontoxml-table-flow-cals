define([
	'fontoxml-operations/operationsManager',

    'json!./sx/operations.json'
], function (
	operationsManager,

	operationsJson
	) {
	'use strict';

	return function install () {
		operationsManager.addOperations(operationsJson);
	};
});
