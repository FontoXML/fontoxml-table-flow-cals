define(
	[
		// Implementation of the abstract model
		'./api/calsTableStructure',

		'./api/buildGridModel',
		'./api/tableGridModelToCalsTable',

		// Commands
		'./api/commands/InsertCalsTableCommand',
		'./api/commands/SetCellHorizontalAlignmentCommand',
		'./api/commands/SetCellVerticalAlignmentCommand',
	],
	function (
		calsTableStructure,

		buildGridModel,
		tableGridModelToCalsTable,

		InsertCalsTableCommand,
		SetCellHorizontalAlignmentCommand,
		SetCellVerticalAlignmentCommand
		) {
		'use strict';

		return {
			calsTableStructure:                    calsTableStructure,
			buildGridModel:                        buildGridModel,
			tableGridModelToCalsTable:             tableGridModelToCalsTable,
			commands: {
				InsertCalsTableCommand:            InsertCalsTableCommand,
				SetCellHorizontalAlignmentCommand: SetCellHorizontalAlignmentCommand,
				SetCellVerticalAlignmentCommand:   SetCellVerticalAlignmentCommand
			}
		};
	}
);
