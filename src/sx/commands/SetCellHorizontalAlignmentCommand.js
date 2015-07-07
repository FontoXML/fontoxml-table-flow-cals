define([
	'fontoxml-blueprints',
	'fontoxml-core',
	'fontoxml-dom-identification/getNodeId',
	'fontoxml-table-flow',

	'./primitives/setCellHorizontalAlignment'
], function (
	blueprints,
	core,
	getNodeId,
	tableFlow,

	setCellHorizontalAlignment
	) {
	'use strict';

	var BlueprintedCommand = core.BlueprintedCommand,
		blueprintQuery = blueprints.blueprintQuery,
		blueprintRangeQuery = blueprints.blueprintRangeQuery;

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

		if (!cellsInSelection[0]) {
			cellsInSelection.push(selectionRange.startContainer);
		}

		var	activeStates = Object.create(null),
			tableInfoByTargetNode = Object.create(null);

		for (var i = 0, l = cellsInSelection.length; i < l; ++i) {
			var tableGridModel = tableGridModelLookupSingleton.getGridModel(cellsInSelection[i]);

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

			var info = tableInfoByTargetNode[getNodeId(tableDefiningNode)];
			if (!info) {
				info = tableInfoByTargetNode[getNodeId(tableDefiningNode)] = {
					tableNode: tableDefiningNode,
					tableGridModel: tableGridModel,
					tableCells: []
				};
			}

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

			info.tableCells.push(tableCell);

			// Only set active state if it matches and hasnt already been set to active.
			if (tableCell.data.alignment === argument.horizontalAlignment &&
				!activeStates[argument.horizontalAlignment]) {

				resultingState.active = true;
				activeStates[argument.horizontalAlignment] = true;
			}
		}

		blueprint.beginOverlay();
		for (var table in tableInfoByTargetNode) {
			var tableInfo = tableInfoByTargetNode[table];
			if (!setCellHorizontalAlignment(
				tableInfo.tableGridModel,
				tableInfo.tableNode,
				blueprint,
				format,
				tableInfo.tableCells,
				argument.horizontalAlignment,
				argument.getState)) {
				return false;
			}
		}

		blueprint.applyOverlay();

		return true;
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
});

