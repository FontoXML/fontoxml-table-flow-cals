define([
	'fontoxml-blueprints',
	'fontoxml-dom-identification/getNodeId',
	'fontoxml-table-flow'
], function (
	blueprints,
	getNodeId,
	tableFlow
) {
	'use strict';

	var blueprintQuery = blueprints.blueprintQuery;

	var tableGridModelLookupSingleton = tableFlow.tableGridModelLookupSingleton;

	var tableGridModelCache = null,
		tableGridModelIndexForCellNodeId = null;

	// Retrieves (and adds just in time) a cached tableGridModel and tableDefiningNode
	function getTableGridModel(blueprint, cellNodeId) {
		if (!tableGridModelIndexForCellNodeId[cellNodeId]) {
			var tableGridModel = tableGridModelLookupSingleton.getGridModel(blueprint.lookup(cellNodeId));

			tableGridModel.tableDefiningNode = blueprintQuery.findClosestAncestor(
				blueprint,
				blueprint.lookup(cellNodeId),
				tableGridModel.tableStructure.isTable.bind(tableGridModel.tableStructure));

			if (tableGridModelCache.indexOf(tableGridModel) === -1) {
				tableGridModelCache.push(tableGridModel);
			}

			tableGridModelIndexForCellNodeId[cellNodeId] = tableGridModelCache.indexOf(tableGridModel);
		}
		return tableGridModelCache[tableGridModelIndexForCellNodeId[cellNodeId]];
	}

	function toggleCellBorder (blueprint, format, resultingState, cellNodeIds, borderTop, borderBottom, borderLeft, borderRight, isGetState) {
		if (!cellNodeIds.length) {
			// Not doing this check will not have an effect on performance, but it will produce an incorrect "active"
			// state, so we might as well exit early
			return false;
		}

		// Temporarily store the data we need to set per cell node
		var queuedMutations = {};

		// Reset caches
		tableGridModelCache = [];
		tableGridModelIndexForCellNodeId = Object.create(null);

		// Find all cells that should get a border-bottom, which is easy
		if (borderBottom !== undefined) {
			cellNodeIds.forEach(function (cellNodeId) {
				if (!queuedMutations[cellNodeId]) {
					queuedMutations[cellNodeId] = {};
				}

				queuedMutations[cellNodeId].rowSeparator = borderBottom;
			});
		}

		// Find all cells that should get a border-right, which is easy
		if (borderRight !== undefined) {
			cellNodeIds.forEach(function (cellNodeId) {
				if (!queuedMutations[cellNodeId]) {
					queuedMutations[cellNodeId] = {};
				}

				queuedMutations[cellNodeId].columnSeparator = borderRight;
			});
		}

		// Find all cells that should get a border-bottom to emulate a border-top we really want
		if (borderTop !== undefined) {
			cellNodeIds.forEach(function (cellNodeId) {
				var tableGridModel = getTableGridModel(blueprint, cellNodeId),
					cellInfo = tableGridModel.getCellByNodeId(cellNodeId);

				if (cellInfo.origin.row < 1) {
					// Cannot set a border-top on the top-most row of cells
					return;
				}

				for (var i = 0; i < cellInfo.size.columns; i++) {
					var neighborCellInfo = tableGridModel.getCellAtCoordinates(
							cellInfo.origin.row - 1,
							cellInfo.origin.column + i),
						neighborCellNodeId = getNodeId(neighborCellInfo.element);

					if (!queuedMutations[neighborCellNodeId]) {
						queuedMutations[neighborCellNodeId] = {};
					}

					queuedMutations[neighborCellNodeId].rowSeparator = borderTop;
				}
			});
		}

		// Find all cells that should get a border-left to emulate a border-right we really want
		if (borderLeft !== undefined) {
			cellNodeIds.forEach(function (cellNodeId) {
				var tableGridModel = getTableGridModel(blueprint, cellNodeId),
					cellInfo = tableGridModel.getCellByNodeId(cellNodeId);

				if (cellInfo.origin.column < 1) {
					// Cannot set a border-left on the left-most column of cells
					return;
				}

				for (var i = 0; i < cellInfo.size.rows; i++) {
					var neighborCellInfo = tableGridModel.getCellAtCoordinates(
							cellInfo.origin.row + i,
							cellInfo.origin.column - 1),
						neighborCellNodeId = getNodeId(neighborCellInfo.element);

					if (!queuedMutations[neighborCellNodeId]) {
						queuedMutations[neighborCellNodeId] = {};
					}

					queuedMutations[neighborCellNodeId].columnSeparator = borderLeft;
				}
			});
		}

		// Determine "active" state, which influences the next loop
		var isActive = resultingState.active = Object.keys(queuedMutations).every(function (cellNodeId) {
			var cellData = queuedMutations[cellNodeId],
				tableGridModel = getTableGridModel(blueprint, cellNodeId),
				tableCellToEdit = tableGridModel.getCellByNodeId(cellNodeId);

			return Object.keys(cellData).every(function (attributeName) {
				return tableCellToEdit.data[attributeName] === (cellData[attributeName] ? '1' : '0');
			});
		});

		// Remove or add data depending on "active" state determined in the previous loop
		Object.keys(queuedMutations).forEach(function (cellNodeId) {
			var cellData = queuedMutations[cellNodeId],
				tableGridModel = getTableGridModel(blueprint, cellNodeId),
				tableCellToEdit = tableGridModel.getCellByNodeId(cellNodeId);

			// If the command is ran to get the state, do not modify any actual cell data
			if (isGetState) {
				tableCellToEdit = tableCellToEdit.clone();
			}

			// If already active we should set the data to the inverse value of the original intent
			Object.keys(cellData).forEach(function (attributeName) {
				var attributeValue = isActive ? !cellData[attributeName] : cellData[attributeName];
				tableCellToEdit.data[attributeName] = attributeValue ? '1' : '0';
			});
		});

		// Loop over every unique table that needs to be changed, applyToDom and return the success state based on that
		return tableGridModelCache.every(function (tableGridModel) {
			return tableGridModel.tableStructure.applyToDom(
				tableGridModel,
				tableGridModel.tableDefiningNode,
				blueprint,
				format);
		});
	}

	return toggleCellBorder;
});
