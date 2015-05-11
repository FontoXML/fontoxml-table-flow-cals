define([
	'fontoxml-operations/operationsManager',

	'fontoxml-table-flow/TableValidator',

	'./api/calsTableStructure'
], function (
	operationsManager,

	TableValidator,

	calsTableStructure
	) {
	'use strict';

	return function configureSxModule (sxModule) {
		sxModule.register('format')
			.addRestrictingValidator(new TableValidator(calsTableStructure));
	};
});

