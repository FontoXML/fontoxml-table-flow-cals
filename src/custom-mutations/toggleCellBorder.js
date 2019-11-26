import CustomMutationResult from 'fontoxml-base-flow/src/CustomMutationResult.js';
import documentsManager from 'fontoxml-documents/src/documentsManager.js';
import evaluateXPathToBoolean from 'fontoxml-selectors/src/evaluateXPathToBoolean.js';
import { getGridModel } from 'fontoxml-table-flow/src/indexedTableGridModels.js';

export default function toggleCellBorder(argument, blueprint, _format, _selection) {
	const cellNodeIds = argument.cellNodeIds;
	if (!cellNodeIds.length) {
		// When no cells are to be changed; return.
		return CustomMutationResult.notAllowed();
	}

	const borders = {
		bottom: argument.bottom,
		right: argument.right,
		top: argument.top,
		left: argument.left
	};
	const currentBorders = {
		bottom: true,
		right: true,
		top: true,
		left: true
	};
	const isToggle = argument.isToggle;

	const cellNode = blueprint.lookup(cellNodeIds[0]);
	const tableGridModel = getGridModel(cellNode, blueprint);
	if (!tableGridModel || tableGridModel.error) {
		return CustomMutationResult.notAllowed();
	}

	// Note: The trueValue and falseValue properties on the table definition are CALS-specific.
	const trueValue = tableGridModel.tableDefinition.trueValue;
	const falseValue = tableGridModel.tableDefinition.falseValue;

	cellNodeIds.forEach(function(cellNodeId) {
		const cellInfo = tableGridModel.getCellByNode(blueprint.lookup(cellNodeId));

		currentBorders.bottom =
			borders.bottom &&
			currentBorders.bottom &&
			evaluateXPathToBoolean('./@rowsep = $setValue', cellInfo.element, blueprint, {
				setValue: borders.bottom ? trueValue : falseValue
			});

		currentBorders.right =
			borders.right &&
			currentBorders.right &&
			evaluateXPathToBoolean('./@colsep = $setValue', cellInfo.element, blueprint, {
				setValue: borders.right ? trueValue : falseValue
			});

		if (borders.top !== undefined && cellInfo.origin.row > 0) {
			for (let i = 0; i < cellInfo.size.columns; i++) {
				const neighborCellInfo = tableGridModel.getCellAtCoordinates(
					cellInfo.origin.row - 1,
					cellInfo.origin.column + i
				);

				currentBorders.top =
					borders.top &&
					currentBorders.top &&
					evaluateXPathToBoolean(
						'./@rowsep = $setValue',
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

				currentBorders.left =
					borders.left &&
					currentBorders.left &&
					evaluateXPathToBoolean(
						'./@colsep = $setValue',
						neighborCellInfo.element,
						blueprint,
						{ setValue: borders.left ? trueValue : falseValue }
					);
			}
		}
	});

	const isActive = Object.keys(borders).every(
		direction => borders[direction] === undefined || currentBorders[direction]
	);

	cellNodeIds.forEach(function(cellNodeId) {
		const cellInfo = tableGridModel.getCellByNode(blueprint.lookup(cellNodeId));

		if (borders.bottom !== undefined) {
			// Find all cells that should get a border-bottom, which is easy

			if (cellInfo.row === tableGridModel.getHeight() - 1) {
				return;
			}

			blueprint.setAttribute(
				cellInfo.element,
				'rowsep',
				(isToggle ? !isActive : borders.bottom) ? trueValue : falseValue
			);
		}

		if (borders.right !== undefined) {
			// Find all cells that should get a border-right, which is easy

			if (cellInfo.column === tableGridModel.getWidth() - 1) {
				return;
			}

			blueprint.setAttribute(
				cellInfo.element,
				'colsep',
				(isToggle ? !isActive : borders.right) ? trueValue : falseValue
			);
		}

		if (borders.top !== undefined && cellInfo.origin.row > 0) {
			// Find all cells that should get a border-bottom to emulate a border-top we really want
			// Cannot set a border-top on the top-most row of cells
			for (let i = 0; i < cellInfo.size.columns; i++) {
				const neighborCellInfo = tableGridModel.getCellAtCoordinates(
					cellInfo.origin.row - 1,
					cellInfo.origin.column + i
				);

				blueprint.setAttribute(
					neighborCellInfo.element,
					'rowsep',
					(isToggle ? !isActive : borders.top) ? trueValue : falseValue
				);
			}
		}

		if (borders.left !== undefined && cellInfo.origin.column > 0) {
			// Find all cells that should get a border-left to emulate a border-right we really want
			// Cannot set a border-left on the left-most column of cells
			for (let i = 0; i < cellInfo.size.rows; i++) {
				const neighborCellInfo = tableGridModel.getCellAtCoordinates(
					cellInfo.origin.row + i,
					cellInfo.origin.column - 1
				);

				blueprint.setAttribute(
					neighborCellInfo.element,
					'colsep',
					(isToggle ? !isActive : borders.left) ? trueValue : falseValue
				);
			}
		}
	});

	const result = CustomMutationResult.ok();
	result.setActive(isActive);

	return result;
}
