define(
	[
		// Implementation of the abstract model
		'./api/CalsTableStructure',

		// Commands
		'./api/commands/InsertCalsTableCommand',
		'./api/commands/SetCellHorizontalAlignmentCommand',
		'./api/commands/SetCellVerticalAlignmentCommand',
	],
	function (
		CalsTableStructure,

		InsertCalsTableCommand,
		SetCellHorizontalAlignmentCommand,
		SetCellVerticalAlignmentCommand
		) {
		'use strict';

		return {
			CalsTableStructure:                    CalsTableStructure,
			commands: {
				InsertCalsTableCommand:            InsertCalsTableCommand,
				SetCellHorizontalAlignmentCommand: SetCellHorizontalAlignmentCommand,
				SetCellVerticalAlignmentCommand:   SetCellVerticalAlignmentCommand
			}
		};
	}
);
