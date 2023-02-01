import CustomMutationResult from 'fontoxml-base-flow/src/CustomMutationResult';
import type Blueprint from 'fontoxml-blueprints/src/Blueprint';
import type { NodeId } from 'fontoxml-dom-identification/src/types';
import { borderModes } from 'fontoxml-table-flow/src/actions/setBorderModeForSelectedCells';
import type {
	BorderModeState,
	BordersForBorderModeBySelectedCellNodeId,
} from 'fontoxml-table-flow/src/api/types';
import { getGridModel } from 'fontoxml-table-flow/src/indexedTableGridModels';
import type TableGridModel from 'fontoxml-table-flow/src/TableGridModel/TableGridModel';

import type CalsTableDefinition from '../table-definition/CalsTableDefinition';

const CELL_BORDER_DIRECTIONS = {
	borderRight: 'border-right',
	borderLeft: 'border-left',
	borderTop: 'border-top',
	borderBottom: 'border-bottom',
};

function createActiveBordersMap() {
	const selectedActiveBordersMap = new Map<
		string,
		{ hasSolidBorders: boolean; hasNoneBorders: boolean }
	>();

	// Set default values.
	selectedActiveBordersMap.set('right', {
		hasSolidBorders: false,
		hasNoneBorders: false,
	});
	selectedActiveBordersMap.set('left', {
		hasSolidBorders: false,
		hasNoneBorders: false,
	});
	selectedActiveBordersMap.set('top', {
		hasSolidBorders: false,
		hasNoneBorders: false,
	});
	selectedActiveBordersMap.set('bottom', {
		hasSolidBorders: false,
		hasNoneBorders: false,
	});

	return selectedActiveBordersMap;
}

/**
 * Determines if the style of the selected borders should be solid or none.
 * When all the selected borders are solid, the new border style should be none.
 * When all the selected borders are none, the new border style should be solid.
 * When there are both solid and none borders, the selected borders should become solid.
 *
 * @param blueprint           -
 * @param bordersByCellNodeId - Contains the affected borders per cell node ID.
 * @param cellNodeIds		  - Contains the affected cell node IDs.
 * @param tableGridModel      -
 * @param activeBordersMap    - Keeps track of which borders are active.
 *
 * @returns The new border style, which either is solid or none.
 */
function determineBorderStyleValue(
	blueprint: Blueprint,
	bordersByCellNodeId: BordersForBorderModeBySelectedCellNodeId,
	cellNodeIds: NodeId[],
	tableGridModel: TableGridModel,
	activeBordersMap: Map<
		string,
		{ hasSolidBorders: boolean; hasNoneBorders: boolean }
	>
) {
	let hasNoneBorderInSelection = false;
	let hasSolidBorderInSelection = false;

	for (const cellNodeId of cellNodeIds) {
		const cellInfo = tableGridModel.getCellByNode(
			blueprint.lookup(cellNodeId)
		);

		// The border directions that will be affected by a border style change.
		const borderDirections = bordersByCellNodeId[cellNodeId];

		if (!cellInfo || !borderDirections) {
			return CustomMutationResult.notAllowed();
		}

		// The border style information for the cell.
		// The rowSeparator resembles the bottom border of the cell while the columnSeparator resembles the right border.
		// We don't need the top and left border information, as we only use the bottom and right borders in CALS.
		const { rowSeparator, columnSeparator } = cellInfo.data;

		// For each affected border, check the border style.
		Object.keys(CELL_BORDER_DIRECTIONS).every((borderDirection) => {
			// Makes sure that only the affected borders are checked.
			if (!borderDirections[borderDirection]) {
				return true;
			}

			// No need to check other cells.
			if (hasSolidBorderInSelection && hasNoneBorderInSelection) {
				return true;
			}

			// Right border.
			if (borderDirection === 'borderRight') {
				if (columnSeparator) {
					hasSolidBorderInSelection = true;

					activeBordersMap.set('right', {
						hasSolidBorders: true,
						hasNoneBorders:
							activeBordersMap.get('right').hasNoneBorders,
					});
				} else {
					hasNoneBorderInSelection = true;

					activeBordersMap.set('right', {
						hasSolidBorders:
							activeBordersMap.get('right').hasSolidBorders,
						hasNoneBorders: true,
					});
				}
			}

			// Bottom border.
			if (borderDirection === 'borderBottom') {
				if (rowSeparator) {
					hasSolidBorderInSelection = true;

					activeBordersMap.set('bottom', {
						hasSolidBorders: true,
						hasNoneBorders:
							activeBordersMap.get('bottom').hasNoneBorders,
					});
				} else {
					hasNoneBorderInSelection = true;

					activeBordersMap.set('bottom', {
						hasSolidBorders:
							activeBordersMap.get('bottom').hasSolidBorders,
						hasNoneBorders: true,
					});
				}
			}

			// Top border.
			if (borderDirection === 'borderTop' && cellInfo.origin.row > 0) {
				const neighborCellInfo = tableGridModel.getCellAtCoordinates(
					cellInfo.origin.row - 1,
					cellInfo.origin.column
				);

				if (!neighborCellInfo) {
					throw new Error('A cell could not be found.');
				}

				const {
					rowSeparator: rowSeparatorNeighborCell,
					columnSeparator: _columnSeparatorNeighborCell,
				} = neighborCellInfo.data;

				if (rowSeparatorNeighborCell) {
					hasSolidBorderInSelection = true;

					activeBordersMap.set('top', {
						hasSolidBorders: true,
						hasNoneBorders:
							activeBordersMap.get('top').hasNoneBorders,
					});
				} else {
					hasNoneBorderInSelection = true;

					activeBordersMap.set('top', {
						hasSolidBorders:
							activeBordersMap.get('top').hasSolidBorders,
						hasNoneBorders: true,
					});
				}
			}

			// Left border.
			if (
				borderDirection === 'borderLeft' &&
				cellInfo.origin.column > 0
			) {
				const neighborCellInfo = tableGridModel.getCellAtCoordinates(
					cellInfo.origin.row,
					cellInfo.origin.column - 1
				);

				if (!neighborCellInfo) {
					throw new Error('A cell could not be found.');
				}

				const {
					rowSeparator: _rowSeparatorNeighborCell,
					columnSeparator: columnSeparatorNeighborCell,
				} = neighborCellInfo.data;

				if (columnSeparatorNeighborCell) {
					hasSolidBorderInSelection = true;

					activeBordersMap.set('left', {
						hasSolidBorders: true,
						hasNoneBorders:
							activeBordersMap.get('left').hasNoneBorders,
					});
				} else {
					hasNoneBorderInSelection = true;

					activeBordersMap.set('left', {
						hasSolidBorders:
							activeBordersMap.get('left').hasSolidBorders,
						hasNoneBorders: true,
					});
				}
			}
			return true;
		});
	}

	if (hasSolidBorderInSelection && !hasNoneBorderInSelection) {
		return false;
	}

	return true;
}

/**
 * In CALS we are not allowed to individually change the table borders.
 * We check if the selected borders are part of the table border.
 *
 * @param blueprint           -
 * @param bordersByCellNodeId - Contains the affected borders per cell node ID.
 * @param cellNodeIds		  - Contains the affected cell node IDs.
 * @param tableGridModel      -
 *
 * @returns True if the selected borders are part of the table border.
 */
function areBordersTableBorders(
	blueprint: Blueprint,
	bordersByCellNodeId: BordersForBorderModeBySelectedCellNodeId,
	cellNodeIds: NodeId[],
	tableGridModel: TableGridModel
) {
	let isBorderModeDisabled = false;

	for (const cellNodeId of cellNodeIds) {
		const cellInfo = tableGridModel.getCellByNode(
			blueprint.lookup(cellNodeId)
		);

		// The border directions that will be affected by a border style change.
		const borderDirections = bordersByCellNodeId[cellNodeId];

		if (!cellInfo || !borderDirections) {
			return CustomMutationResult.notAllowed();
		}

		// For each affected border, check if border is table border.
		Object.keys(CELL_BORDER_DIRECTIONS).every((borderDirection) => {
			// Makes sure that only the affected borders are checked.
			if (!borderDirections[borderDirection]) {
				return true;
			}

			// No need to check other cells.
			if (isBorderModeDisabled) {
				return true;
			}

			switch (borderDirection) {
				case 'borderRight':
					if (
						tableGridModel.getWidth() ===
						cellInfo.origin.column + 1
					) {
						isBorderModeDisabled = true;
					}

					break;
				case 'borderLeft':
					if (cellInfo.origin.column === 0) {
						isBorderModeDisabled = true;
					}

					break;
				case 'borderTop':
					if (cellInfo.origin.row === 0) {
						isBorderModeDisabled = true;
					}

					break;
				case 'borderBottom':
					if (
						tableGridModel.getHeight() ===
						cellInfo.origin.row + 1
					) {
						isBorderModeDisabled = true;
					}

					break;
			}

			return true;
		});
	}

	return isBorderModeDisabled;
}

/**
 * Checks the enabled state for the inner borderModes.
 * The inner border modes are 'inner' | 'inner-vertical' | 'inner-horizontal'.
 *
 * If there are no borders set to true in the bordersByCellNodeId, it means that
 * no borders are allowed to be changed.
 *
 * @param bordersByCellNodeId - Contains the affected borders per cell node ID.
 * @returns If the inner borderMode should be enabled.
 */
function getStateInnerBorderModes(
	bordersByCellNodeId: BordersForBorderModeBySelectedCellNodeId
): boolean {
	let isInnerBorderModeEnabled = false;

	for (const cellNodeId in bordersByCellNodeId) {
		const bordersForCellNodeId = bordersByCellNodeId[cellNodeId];

		if (!isInnerBorderModeEnabled) {
			isInnerBorderModeEnabled =
				bordersForCellNodeId.borderRight ||
				bordersForCellNodeId.borderTop ||
				bordersForCellNodeId.borderLeft ||
				bordersForCellNodeId.borderBottom;
		}
	}

	return isInnerBorderModeEnabled;
}

/**
 * Toggles the border style the selected borders based on the current border style(s).
 * Works for CALS and can be used with the different border modes, like border-left e.g.
 *
 * @param argument  -
 * @param blueprint -
 *
 * @returns The custom mutation result.
 */
export default function calsToggleBordersForSelectedCellsCustomMutation(
	argument: {
		borderMode: BorderModeState;
		bordersByCellNodeId: BordersForBorderModeBySelectedCellNodeId;
	},
	blueprint: Blueprint
): CustomMutationResult {
	const borderMode = argument.borderMode;

	if (!borderMode || !borderModes.includes(borderMode)) {
		throw new Error(
			`Unexpected border mode used: "${borderMode}". Consider using one of the following options: "${borderModes.join(
				'", "'
			)}"`
		);
	}

	const bordersByCellNodeId = argument.bordersByCellNodeId || {};

	// Get affected cell node IDs.
	const cellNodeIds = Object.keys(bordersByCellNodeId);

	if (cellNodeIds.length === 0) {
		return CustomMutationResult.notAllowed();
	}

	const cellNode = cellNodeIds[0] && blueprint.lookup(cellNodeIds[0]);
	const tableGridModel = getGridModel(cellNode, blueprint);

	if (!tableGridModel || 'error' in tableGridModel) {
		return CustomMutationResult.notAllowed();
	}

	const tableDefinition =
		tableGridModel.tableDefinition as CalsTableDefinition;

	// Note: The trueValue and falseValue properties on the table definition are CALS-specific.
	const trueValue = tableDefinition.trueValue;
	const falseValue = tableDefinition.falseValue;

	// Used to check which border mode should be active.
	const activeBordersMap = createActiveBordersMap();

	// Check if borderMode will change table border.
	const isBorderModeDisabled = areBordersTableBorders(
		blueprint,
		bordersByCellNodeId,
		cellNodeIds,
		tableGridModel
	);

	// The borderMode is part of the table border, so we disable the borderMode.
	if (isBorderModeDisabled) {
		return CustomMutationResult.notAllowed();
	}

	// Checks if inner borderModes should be enabled.
	if (
		borderMode === 'inner' ||
		borderMode === 'inner-horizontal' ||
		borderMode === 'inner-vertical'
	) {
		const isInnerBorderModeEnabled =
			getStateInnerBorderModes(bordersByCellNodeId);

		if (!isInnerBorderModeEnabled) {
			return CustomMutationResult.notAllowed();
		}
	}

	// Determine the new border style for the selected borders and set active borders in map.
	const newBorderStyleValue = determineBorderStyleValue(
		blueprint,
		bordersByCellNodeId,
		cellNodeIds,
		tableGridModel,
		activeBordersMap
	);

	// Iterate over the cells from the cell selection and the adjacent cells.
	for (const cellNodeId of cellNodeIds) {
		const cellNode = blueprint.lookup(cellNodeId);

		// The border of the cell that will be affected by a border style change.
		const borderDirections = bordersByCellNodeId[cellNodeId];

		if (!borderDirections) {
			return CustomMutationResult.notAllowed();
		}

		// For each border style, set the new value.
		Object.keys(CELL_BORDER_DIRECTIONS).forEach((borderDirection) => {
			// Makes sure that only the affected borders are checked.
			if (!borderDirections[borderDirection]) {
				return;
			}

			if (borderDirection === 'borderRight') {
				// Change border value in blueprint.
				blueprint.setAttribute(
					cellNode,
					tableDefinition.colsepLocalName,
					newBorderStyleValue ? trueValue : falseValue
				);

				return;
			}

			if (borderDirection === 'borderBottom') {
				// Change border value in blueprint.
				blueprint.setAttribute(
					cellNode,
					tableDefinition.rowsepLocalName,
					newBorderStyleValue ? trueValue : falseValue
				);
			}
		});
	}

	const borderStylesInSelectionForBorderMode =
		activeBordersMap.get(borderMode);

	// Check if right, bottom, left or top direction is active.
	if (borderStylesInSelectionForBorderMode) {
		if (
			borderStylesInSelectionForBorderMode &&
			borderStylesInSelectionForBorderMode.hasSolidBorders &&
			!borderStylesInSelectionForBorderMode.hasNoneBorders
		) {
			return CustomMutationResult.ok().setActive();
		}
	} else {
		// Check if inner, inner vertical or inner horizontal is active.
		let hasInnerSelectionNoneBorder = false;
		let hasInnerSelectionSolidBorder = false;

		for (const [_key, value] of activeBordersMap) {
			hasInnerSelectionNoneBorder = !hasInnerSelectionNoneBorder
				? value.hasNoneBorders
				: hasInnerSelectionNoneBorder;
			hasInnerSelectionSolidBorder = !hasInnerSelectionSolidBorder
				? value.hasSolidBorders
				: hasInnerSelectionSolidBorder;
		}

		if (hasInnerSelectionSolidBorder && !hasInnerSelectionNoneBorder) {
			return CustomMutationResult.ok().setActive();
		}
	}

	return CustomMutationResult.ok();
}
