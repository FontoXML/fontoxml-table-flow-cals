define(
	[
		// Implementation of the abstract model
		'./api/calsTableStructure',

		// Commands
		'./api/commands/InsertCalsTableCommand',
		'./api/commands/SetCellHorizontalAlignmentCommand',
		'./api/commands/SetCellVerticalAlignmentCommand',
	],
	function (
		calsTableStructure,

		InsertCalsTableCommand,
		SetCellHorizontalAlignmentCommand,
		SetCellVerticalAlignmentCommand
		) {
		'use strict';

		return {
			calsTableStructure:                    calsTableStructure,
			commands: {
				InsertCalsTableCommand:            InsertCalsTableCommand,
				SetCellHorizontalAlignmentCommand: SetCellHorizontalAlignmentCommand,
				SetCellVerticalAlignmentCommand:   SetCellVerticalAlignmentCommand
			}
		};
	}
);
