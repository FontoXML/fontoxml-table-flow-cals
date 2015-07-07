define([
], function (
	) {
	'use strict';

	/**
	 * Set the horizontal alignment of a single cell in a cals table
	 *
	 * @param  {TableGridModel}  tableGridModel     The tableGridModel to use for the table
	 * @param  {Blueprint}       blueprint          The blueprint in which to perform the table mutation
	 * @param  {Format}          format             The format to use for validation
	 * @param  {TableCell[]}     tableCells         The tableCells which alignments to adjust
	 * @param  {string}          horizontalAlignment  One of the horizontalAlignments enum values
	 * @param  {Boolean}         isDryRun           Whether this is a dry run and should not persist changes to the internal model
	 * @param  {BlueprintRange}  selectionRange     The selectionRange to change optionally
	 */
	return function setCellHorizontalAlignment (tableGridModel, tableDefiningNode, blueprint, format, tableCells, horizontalAlignment, isDryRun, selectionRange) {
		var structure = tableGridModel.tableStructure;
		if (!structure) {
			return false;
		}

		var clonedTableGridModel = isDryRun ?
				tableGridModel.clone() :
				tableGridModel;

		for (var i = 0, l = tableCells.length; i < l; ++i) {
			// Use a clone of the cell,
			// do not edit it directly
			var cell = clonedTableGridModel.getCellAtCoordinates(
					tableCells[i].origin.row,
					tableCells[i].origin.column);
			if (!cell) {
				return false;
			}

			cell.data.alignment = horizontalAlignment;
		}

		return structure.applyToDom(clonedTableGridModel, tableDefiningNode, blueprint, format);
	};
});

