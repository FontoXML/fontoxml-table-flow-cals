define([
	'fontoxml-operations/operationsManager',
	'fontoxml-table-flow/tableManager',

	'./calsTableStructure',

	'json!./sx/operations.json'
], function (
	operationsManager,
	tableManager,

	calsTableStructure,

	operationsJson
	) {
	'use strict';

	return function install () {
		tableManager.setTableStructures([calsTableStructure]);

		operationsManager.addOperations(operationsJson);
	};
});
