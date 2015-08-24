define([
	'fontoxml-operations/operationsManager',

	'fontoxml-table-flow/TableValidator',

	'./calsTableStructure',
	'./sx/commands/InsertCalsTableCommand'
], function (
	operationsManager,

	TableValidator,

	calsTableStructure,
	InsertCalsTableCommand
	) {
	'use strict';

	return function configureSxModule (sxModule) {
		sxModule.configure('commands')
			.addCommand('table-insert', new InsertCalsTableCommand());

		sxModule.configure('format')
			.addRestrictingValidator(new TableValidator(calsTableStructure));
	};
});
