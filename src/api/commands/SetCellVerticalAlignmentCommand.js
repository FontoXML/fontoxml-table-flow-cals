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
			blueprintQuery = blueprints.blueprintQuery,
			blueprintRangeQuery = blueprints.blueprintRangeQuery;

		var getNodeId = domIdentification.getNodeId;

		var domQuery = domUtils.domQuery;

		var tableGridModelLookupSingleton = tableFlow.tableGridModelLookupSingleton;

		function draftValidBlueprint (argument, blueprint, format, selectionRange, resultingState) {
			var cellsInSelection = blueprintRangeQuery.findNodesPartiallyInRange(
					blueprint,
					selectionRange,
					'entry',
					true);

			cellsInSelection = cellsInSelection.concat(blueprintRangeQuery.findNodesContainedInRange(
					blueprint,
					selectionRange,
					'entry',
					true));

			var tableGridModels = [],
				tableGridModel;

			if (!cellsInSelection[0]) {
				cellsInSelection.push(selectionRange.startContainer);
			}

			var tableCells = [],
				tableDefiningNodes = [],
				activeStates = Object.create(null);
			for (var i = 0, l = cellsInSelection.length; i < l; ++i) {
				tableGridModel = tableGridModelLookupSingleton.getGridModel(cellsInSelection[i]);
				tableGridModels.push(tableGridModel);

				if (!tableGridModel) {
					return false;
				}

				var cellNode = cellsInSelection[i];

				// Get the table root node
				var tableDefiningNode = blueprintQuery.findClosestAncestor(
						blueprint,
						cellNode,
						tableGridModel.tableStructure.isTable.bind(tableGridModel.tableStructure));

				if (!tableDefiningNode) {
					return false;
				}

				tableDefiningNodes.push(tableDefiningNode);

				// TODO: Try and find the tableGridModel for the node by going through the ancestors. Or something similair.
				//         Apply this for all table related commands.
				var targetNode = blueprintQuery.findClosestAncestor(
						blueprint,
						cellNode,
						tableGridModel.tableStructure.isTableCell.bind(tableGridModel.tableStructure));
				if (!targetNode) {
					return false;
				}

				var tableCell = tableGridModel.getCellByNodeId(getNodeId(targetNode));

				if (!tableCell) {
					return false;
				}

				tableCells.push(tableCell);

				// Only set active state if it matches and hasnt allready been set to active.
				if (tableCell.data.verticalAlignment === argument.verticalAlignment && !activeStates[argument.verticalAlignment]) {
					resultingState.active = true;
					activeStates[argument.verticalAlignment] = true;
				}

			}

			return setCellVerticalAlignment(
				tableGridModels,
				tableDefiningNodes,
				blueprint,
				format,
				tableCells,
				argument.verticalAlignment,
				argument.getState);
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
