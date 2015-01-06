define(
	[
		'fontoxml-base-flow',
		'fontoxml-blueprints',
		'fontoxml-dom-identification',
		'fontoxml-dom-utils',

		'../../TableGridModelLookupSingleton',

		'../primitives/setCellVerticalAlignment'
	],
	function (
		baseFlow,
		blueprints,
		domIdentification,
		domUtils,

		tableGridModelLookupSingleton,

		setCellVerticalAlignment
		) {
		'use strict';

		var BlueprintedCommand = baseFlow.BlueprintedCommand,
			BlueprintPosition = blueprints.BlueprintPosition,
			blueprintQuery = blueprints.blueprintQuery;

		var getNodeId = domIdentification.getNodeId;

		var domQuery = domUtils.domQuery;

		function draftValidBlueprint (argument, blueprint, format, selectionRange) {
			// TODO: Extract this to util function?
			var targetNode = blueprintQuery.findClosestAncestor(blueprint, selectionRange.startContainer, function (node) {
				return tableGridModelLookupSingleton.tableStructures.some(function (tableStructure) {
					return tableStructure.isTableCell(node);
				});
			});

			if (!targetNode) {
				return false;
			}

			var tableDefiningNode;

			// TODO: Extract this to util function?
			for (var index = 0, length = tableGridModelLookupSingleton.tableStructures.length;
				index < length; ++index) {
				var structure = tableGridModelLookupSingleton.tableStructures[index];

				tableDefiningNode = structure.getTableDefiningNode(targetNode);
			}

			if (!tableDefiningNode) {
				return false;
			}

			var tableGridModel = tableGridModelLookupSingleton.getGridModel(tableDefiningNode);
			if (!tableGridModel) {
				return false;
			}

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