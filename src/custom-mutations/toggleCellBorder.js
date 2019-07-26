import CustomMutationResult from 'fontoxml-base-flow/src/CustomMutationResult.js';
import documentsManager from 'fontoxml-documents/src/documentsManager.js';
import evaluateXPathToBoolean from 'fontoxml-selectors/src/evaluateXPathToBoolean.js';
import { getGridModel } from 'fontoxml-table-flow/src/indexedTableGridModels.js';

export default function toggleCellBorder(argument, blueprint, _format, _selection) {
	var cellNodeIds = argument.cellNodeIds;
	if (!cellNodeIds.length) {
		// When no cells are to be changed; return.
		return CustomMutationResult.notAllowed();
	}

	var borders = {
		bottom: argument.bottom,
		right: argument.right,
		top: argument.top,
		left: argument.left
	};
	var isToggle =
		Object.keys(borders).reduce(function(numberOfBordersToBeSet, borderKey) {
			return borders[borderKey] ? numberOfBordersToBeSet + 1 : numberOfBordersToBeSet;
		}, 0) === 1;

	var isActive = true;

	var cellNode = documentsManager.getNodeById(cellNodeIds[0]);
	var tableGridModel = getGridModel(cellNode, blueprint);

	// Note: The trueValue and falseValue properties on the table definition are CALS-specific.
	var trueValue = tableGridModel.tableDefinition.trueValue;
	var falseValue = tableGridModel.tableDefinition.falseValue;

	// Find all cells that should get a border-bottom, which is easy
	if (borders.bottom !== undefined) {
		cellNodeIds.forEach(function(cellNodeId) {
			var cellInfo = tableGridModel.getCellByNodeId(cellNodeId);
			if (cellInfo.row === tableGridModel.getHeight() - 1) {
				return;
			}

			var bottom = evaluateXPathToBoolean(
				'./@rowsep = $setValue',
				cellInfo.element,
				blueprint,
				{ setValue: borders.bottom ? trueValue : falseValue }
			);
			if (isActive) {
				isActive = bottom;
			}
			blueprint.setAttribute(
				cellInfo.element,
				'rowsep',
				(isToggle ? !bottom : borders.bottom) ? trueValue : falseValue
			);
		});
	}

	// Find all cells that should get a border-right, which is easy
	if (borders.right !== undefined) {
		cellNodeIds.forEach(function(cellNodeId) {
			var cellInfo = tableGridModel.getCellByNodeId(cellNodeId);
			if (cellInfo.column === tableGridModel.getWidth() - 1) {
				return;
			}

			var right = evaluateXPathToBoolean(
				'./@colsep = $setValue',
				cellInfo.element,
				blueprint,
				{ setValue: borders.right ? trueValue : falseValue }
			);
			if (isActive) {
				isActive = right;
			}
			blueprint.setAttribute(
				cellInfo.element,
				'colsep',
				(isToggle ? !right : borders.right) ? trueValue : falseValue
			);
		});
	}

	// Find all cells that should get a border-bottom to emulate a border-top we really want
	if (borders.top !== undefined) {
		cellNodeIds.forEach(function(cellNodeId) {
			var cellInfo = tableGridModel.getCellByNodeId(cellNodeId);

			if (cellInfo.origin.row < 1) {
				// Cannot set a border-top on the top-most row of cells
				return;
			}

			for (var i = 0; i < cellInfo.size.columns; i++) {
				var neighborCellInfo = tableGridModel.getCellAtCoordinates(
					cellInfo.origin.row - 1,
					cellInfo.origin.column + i
				);

				var top = evaluateXPathToBoolean(
					'./@rowsep = $setValue',
					neighborCellInfo.element,
					blueprint,
					{ setValue: borders.top ? trueValue : falseValue }
				);
				if (isActive) {
					isActive = top;
				}
				blueprint.setAttribute(
					neighborCellInfo.element,
					'rowsep',
					(isToggle ? !top : borders.top) ? trueValue : falseValue
				);
			}
		});
	}

	// Find all cells that should get a border-left to emulate a border-right we really want
	if (borders.left !== undefined) {
		cellNodeIds.forEach(function(cellNodeId) {
			var cellInfo = tableGridModel.getCellByNodeId(cellNodeId);

			if (cellInfo.origin.column < 1) {
				// Cannot set a border-left on the left-most column of cells
				return;
			}

			for (var i = 0; i < cellInfo.size.rows; i++) {
				var neighborCellInfo = tableGridModel.getCellAtCoordinates(
					cellInfo.origin.row + i,
					cellInfo.origin.column - 1
				);

				var left = evaluateXPathToBoolean(
					'./@colsep = $setValue',
					neighborCellInfo.element,
					blueprint,
					{ setValue: borders.left ? trueValue : falseValue }
				);
				if (isActive) {
					isActive = left;
				}
				blueprint.setAttribute(
					neighborCellInfo.element,
					'colsep',
					(isToggle ? !left : borders.left) ? trueValue : falseValue
				);
			}
		});
	}

	var result = CustomMutationResult.ok();
	result.setActive(isActive);

	return result;
}
