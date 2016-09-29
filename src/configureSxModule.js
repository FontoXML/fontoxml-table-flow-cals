define([
	'fontoxml-operations/operationsManager',

	'fontoxml-table-flow/TableValidator',

	'./calsTableStructure',
	'./sx/commands/InsertCalsTableCommand',
	'./sx/commands/ToggleCellBorderCommand'
], function (
	operationsManager,

	TableValidator,

	calsTableStructure,
	InsertCalsTableCommand,
	ToggleCellBorderCommand
	) {
	'use strict';

	return function configureSxModule (sxModule) {
		sxModule.configure('commands')
			.addCommand('table-insert', new InsertCalsTableCommand())
			.addCommand('toggle-cell-border', new ToggleCellBorderCommand());

		sxModule.configure('format')
			.addRestrictingValidator(new TableValidator(calsTableStructure));
	};
});
