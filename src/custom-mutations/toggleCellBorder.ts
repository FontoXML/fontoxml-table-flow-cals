import CustomMutationResult from 'fontoxml-base-flow/src/CustomMutationResult';
import type Blueprint from 'fontoxml-blueprints/src/Blueprint';
import type { NodeId } from 'fontoxml-dom-identification/src/types';
import evaluateXPathToBoolean from 'fontoxml-selectors/src/evaluateXPathToBoolean';
import xq from 'fontoxml-selectors/src/xq';
import { getGridModel } from 'fontoxml-table-flow/src/indexedTableGridModels';

import type CalsTableDefinition from '../table-definition/CalsTableDefinition';

export default function toggleCellBorder(
	argument: {
		cellNodeIds: NodeId[];
		bottom: boolean;
		right: boolean;
		left: boolean;
		top: boolean;
		isToggle: boolean;
	},
	blueprint: Blueprint
): CustomMutationResult {
	const cellNodeIds = argument.cellNodeIds;
	const cellNode = cellNodeIds[0] && blueprint.lookup(cellNodeIds[0]);
	if (
		!cellNode ||
		// ancestors: row, tbody/thead, tgroup
		!evaluateXPathToBoolean(
			xq`ancestor::*[3][fonto:is-cals-table(.)]`,
			cellNode,
			blueprint
		)
	) {
		// We allow to execute this when the cellNodeIds are part of a cals table
		return CustomMutationResult.notAllowed();
	}

	const borders = {
		bottom: argument.bottom,
		right: argument.right,
		top: argument.top,
		left: argument.left,
	};
	const currentBorders = {
		bottom: true,
		right: true,
		top: true,
		left: true,
	};
	const isToggle = argument.isToggle;

	const tableGridModel = getGridModel(cellNode, blueprint);
	if (!tableGridModel || 'error' in tableGridModel) {
		return CustomMutationResult.notAllowed();
	}

	const tableDefinition =
		tableGridModel.tableDefinition as CalsTableDefinition;

	// Note: The trueValue and falseValue properties on the table definition are CALS-specific.
	const trueValue = tableDefinition.trueValue;
	const falseValue = tableDefinition.falseValue;

	for (const cellNodeId of cellNodeIds) {
		const cellInfo = tableGridModel.getCellByNode(
			blueprint.lookup(cellNodeId)
		);
		if (!cellInfo) {
			return CustomMutationResult.notAllowed();
		}

		currentBorders.bottom =
			currentBorders.bottom &&
			evaluateXPathToBoolean(
				xq`./@*[name(.)=${tableDefinition.rowsepLocalName}] = $setValue`,
				cellInfo.element,
				blueprint,
				{
					setValue: borders.bottom ? trueValue : falseValue,
				}
			);

		currentBorders.right =
			currentBorders.right &&
			evaluateXPathToBoolean(
				xq`./@*[name(.)=${tableDefinition.colsepLocalName}] = $setValue`,
				cellInfo.element,
				blueprint,
				{
					setValue: borders.right ? trueValue : falseValue,
				}
			);

		if (borders.top !== undefined && cellInfo.origin.row > 0) {
			for (let i = 0; i < cellInfo.size.columns; i++) {
				const neighborCellInfo = tableGridModel.getCellAtCoordinates(
					cellInfo.origin.row - 1,
					cellInfo.origin.column + i
				);

				if (!neighborCellInfo) {
					throw new Error('A cell could not be found.');
				}

				currentBorders.top =
					currentBorders.top &&
					evaluateXPathToBoolean(
						xq`./@*[name(.)=${tableDefinition.rowsepLocalName}] = $setValue`,
						neighborCellInfo.element,
						blueprint,
						{ setValue: borders.top ? trueValue : falseValue }
					);
			}
		}

		if (borders.left !== undefined && cellInfo.origin.column > 0) {
			for (let i = 0; i < cellInfo.size.rows; i++) {
				const neighborCellInfo = tableGridModel.getCellAtCoordinates(
					cellInfo.origin.row + i,
					cellInfo.origin.column - 1
				);

				if (!neighborCellInfo) {
					throw new Error('A cell could not be found.');
				}

				currentBorders.left =
					currentBorders.left &&
					evaluateXPathToBoolean(
						xq`./@*[name(.)=${tableDefinition.colsepLocalName}] = $setValue`,
						neighborCellInfo.element,
						blueprint,
						{ setValue: borders.left ? trueValue : falseValue }
					);
			}
		}
	}

	const isActive = Object.keys(borders).every(
		(direction) =>
			borders[direction] === undefined || currentBorders[direction]
	);

	if (isActive && !isToggle) {
		return CustomMutationResult.notAllowed().setActive(true);
	}

	for (const cellNodeId of cellNodeIds) {
		const cellInfo = tableGridModel.getCellByNode(
			blueprint.lookup(cellNodeId)
		);
		if (!cellInfo) {
			return CustomMutationResult.notAllowed();
		}

		if (borders.bottom !== undefined) {
			// Find all cells that should get a border-bottom, which is easy
			// Disable setting the BOTTOM border for the cells in the last row
			if (
				cellInfo.origin.row + cellInfo.size.rows ===
					tableGridModel.getHeight() &&
				borders.right === undefined &&
				borders.top === undefined &&
				borders.left === undefined
			) {
				return CustomMutationResult.notAllowed();
			}

			blueprint.setAttribute(
				cellInfo.element,
				tableDefinition.rowsepLocalName,
				(isToggle ? !isActive : borders.bottom) ? trueValue : falseValue
			);
		}
		if (borders.right !== undefined) {
			// Find all cells that should get a border-right, which is easy
			// Disable setting the RIGHT border for the cells in last column
			if (
				cellInfo.origin.column + cellInfo.size.columns ===
					tableGridModel.getWidth() &&
				borders.bottom === undefined &&
				borders.top === undefined &&
				borders.left === undefined
			) {
				return CustomMutationResult.notAllowed();
			}

			blueprint.setAttribute(
				cellInfo.element,
				tableDefinition.colsepLocalName,
				(isToggle ? !isActive : borders.right) ? trueValue : falseValue
			);
		}
		// Disable setting the TOP border for the cells in the first row
		if (
			borders.top !== undefined &&
			cellInfo.origin.row === 0 &&
			borders.left === undefined &&
			borders.bottom === undefined &&
			borders.right === undefined
		) {
			return CustomMutationResult.notAllowed();
		}

		if (borders.top !== undefined && cellInfo.origin.row > 0) {
			// Find all cells that should get a border-bottom to emulate a border-top we really want
			// Cannot set a border-top on the top-most row of cells
			for (let i = 0; i < cellInfo.size.columns; i++) {
				const neighborCellInfo = tableGridModel.getCellAtCoordinates(
					cellInfo.origin.row - 1,
					cellInfo.origin.column + i
				);

				if (!neighborCellInfo) {
					throw new Error('A cell could not be found.');
				}

				blueprint.setAttribute(
					neighborCellInfo.element,
					tableDefinition.rowsepLocalName,
					(isToggle ? !isActive : borders.top)
						? trueValue
						: falseValue
				);
			}
		}

		// Disable setting the LEFT border for the cells in the first column
		if (
			borders.left !== undefined &&
			cellInfo.origin.column === 0 &&
			borders.bottom === undefined &&
			borders.top === undefined &&
			borders.right === undefined
		) {
			return CustomMutationResult.notAllowed();
		}

		if (borders.left !== undefined && cellInfo.origin.column > 0) {
			// Find all cells that should get a border-left to emulate a border-right we really want
			// Cannot set a border-left on the left-most column of cells
			for (let i = 0; i < cellInfo.size.rows; i++) {
				const neighborCellInfo = tableGridModel.getCellAtCoordinates(
					cellInfo.origin.row + i,
					cellInfo.origin.column - 1
				);

				if (!neighborCellInfo) {
					throw new Error('A cell could not be found.');
				}

				blueprint.setAttribute(
					neighborCellInfo.element,
					tableDefinition.colsepLocalName,
					(isToggle ? !isActive : borders.left)
						? trueValue
						: falseValue
				);
			}
		}
	}

	const result = CustomMutationResult.ok();
	result.setActive(isActive);

	return result;
}
