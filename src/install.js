define([
	'fontoxml-operations/operationsManager',
	'fontoxml-table-flow/tableManager',

	'./calsTableStructure'
], function (
	operationsManager,
	tableManager,

	calsTableStructure
	) {
	'use strict';

	return function install () {
		tableManager.addTableStructure(calsTableStructure);
	};
});
