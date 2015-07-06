define([
	'fontoxml-operations/operationsManager',

	'fontoxml-table-flow/TableValidator',

	'./calsTableStructure',
	'./sx/commands/InsertCalsTableCommand',
	'./sx/commands/SetCellHorizontalAlignmentCommand',
	'./sx/commands/SetCellVerticalAlignmentCommand'
], function (
	operationsManager,

	TableValidator,

	calsTableStructure,
	InsertCalsTableCommand,
	SetCellHorizontalAlignmentCommand,
	SetCellVerticalAlignmentCommand
	) {
	'use strict';

	return function configureSxModule (sxModule) {
		sxModule.configure('commands')
			.addCommand('table-insert', new InsertCalsTableCommand())
			.addCommand('set-cell-horizontal-alignment', new SetCellHorizontalAlignmentCommand())
			.addCommand('set-cell-vertical-alignment', new SetCellVerticalAlignmentCommand());

		sxModule.configure('format')
			.addRestrictingValidator(new TableValidator(calsTableStructure));
	};
});
