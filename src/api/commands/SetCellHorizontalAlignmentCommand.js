define(
	[
		'fontoxml-base-flow',
		'fontoxml-blueprints',
		'fontoxml-dom-identification',
		'fontoxml-dom-utils',
		'fontoxml-table-flow',

		'../primitives/setCellHorizontalAlignment'
	],
	function (
		baseFlow,
		blueprints,
		domIdentification,
		domUtils,
		tableFlow,

		setCellHorizontalAlignment
		) {
		'use strict';

		var BlueprintedCommand = baseFlow.BlueprintedCommand,
			BlueprintPosition = blueprints.BlueprintPosition,
			blueprintQuery = blueprints.blueprintQuery;

		var getNodeId = domIdentification.getNodeId;

		var domQuery = domUtils.domQuery;

		var tableGridModelLookupSingleton = tableFlow.tableGridModelLookupSingleton;

		function draftValidBlueprint (argument, blueprint, format, selectionRange, resultingState) {
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

			if (tableCell.data.alignment === argument.horizontalAlignment) {
				resultingState.active = true;
			}

			var rowIndex = tableCell.origin.row,
				columnIndex = tableCell.origin.column;

			var blueprintPosition = BlueprintPosition.fromOffset(
				selectionRange.startContainer,
				selectionRange.startOffset,
				blueprint);

			return setCellHorizontalAlignment(
					tableGridModel,
					tableDefiningNode,
					blueprint,
					format,
					rowIndex,
					columnIndex,
					argument.horizontalAlignment,
					argument.getState,
					selectionRange);
		}

		function SetCellHorizontalAlignmentCommand () {
			BlueprintedCommand.call(this, draftValidBlueprint);
		}

		SetCellHorizontalAlignmentCommand.prototype = Object.create(BlueprintedCommand.prototype);
		SetCellHorizontalAlignmentCommand.prototype.constructor = SetCellHorizontalAlignmentCommand;

		SetCellHorizontalAlignmentCommand.prototype.getState = function (commandContext, argument) {
			argument.getState = true;

			var toReturn = BlueprintedCommand.prototype.getState.call(this, commandContext, argument);

			argument.getState = false;

			return toReturn;
		};

		return SetCellHorizontalAlignmentCommand;
	}
);
