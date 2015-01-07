define(
	[
		'fontoxml-base-flow',
		'fontoxml-blueprints',
		'fontoxml-dom-identification',
		'fontoxml-dom-utils',

		'fontoxml-table-flow',

		'../primitives/setCellVerticalAlignment'
	],
	function (
		baseFlow,
		blueprints,
		domIdentification,
		domUtils,

		tableFlow,

		setCellVerticalAlignment
		) {
		'use strict';

		var BlueprintedCommand = baseFlow.BlueprintedCommand,
			BlueprintPosition = blueprints.BlueprintPosition,
			blueprintQuery = blueprints.blueprintQuery;

		var getNodeId = domIdentification.getNodeId;

		var domQuery = domUtils.domQuery;

		var tableGridModelLookupSingleton = tableFlow.tableGridModelLookupSingleton;

		function draftValidBlueprint (argument, blueprint, format, selectionRange) {
			// TODO: Extract this to util function?
			var tableGridModel = tableGridModelLookupSingleton.getGridModel(selectionRange.startContainer);

			if (!tableGridModel) {
				return false;
			}

			// TODO: Try and find the tableGridModel for the node by going through the ancestors. Or something similair.
			//         Apply this for all table related commands.
			var targetNode = blueprintQuery.findClosestAncestor(
					blueprint,
					selectionRange.startContainer,
					tableGridModel.tableStructure.isTableCell.bind(tableGridModel.tableStructure));
			if (!targetNode) {
				return false;
			}

			// Get the table root node
			var tableDefiningNode = blueprintQuery.findClosestAncestor(
					blueprint,
					targetNode,
					tableGridModel.tableStructure.isTable.bind(tableGridModel.tableStructure));

			var tableCell = tableGridModel.getCellByNodeId(getNodeId(targetNode));
			if (!tableCell) {
				return false;
			}

			var rowIndex = tableCell.origin.row,
				columnIndex = tableCell.origin.column;

			var blueprintPosition = BlueprintPosition.fromOffset(
				selectionRange.startContainer,
				selectionRange.startOffset,
				blueprint);

			return setCellVerticalAlignment(
					tableGridModel,
					tableDefiningNode,
					blueprint,
					format,
					rowIndex,
					columnIndex,
					argument.verticalAlignment,
					argument.getState,
					selectionRange);
		}

		function SetCellVerticalAlignmentCommand () {
			BlueprintedCommand.call(this, draftValidBlueprint);
		}

		SetCellVerticalAlignmentCommand.prototype = Object.create(BlueprintedCommand.prototype);
		SetCellVerticalAlignmentCommand.prototype.constructor = SetCellVerticalAlignmentCommand;

		SetCellVerticalAlignmentCommand.prototype.getState = function (commandContext, argument) {
			argument.getState = true;

			var toReturn = BlueprintedCommand.prototype.getState.call(this, commandContext, argument);

			argument.getState = false;

			return toReturn;
		};

		return SetCellVerticalAlignmentCommand;
	}
);
