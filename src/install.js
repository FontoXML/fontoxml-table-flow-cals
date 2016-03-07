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
		tableManager.addTableStructure(calsTableStructure);

		operationsManager.addOperations(operationsJson);
	};
});
