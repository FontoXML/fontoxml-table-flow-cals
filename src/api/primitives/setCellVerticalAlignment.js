define([],
	function () {
		'use strict';

		/**
		 * Set the vertical alignment of a single cell in a cals table
		 *
		 * @param  {TableGridModel}  tableGridModel     The tableGridModel to use for the table
		 * @param  {Blueprint}       blueprint          The blueprint in which to perform the table mutation
		 * @param  {Format}          format             The format to use for validation
		 * @param  {TableCell[]}     tableCells         The tableCells which alignments to adjust
		 * @param  {string}          verticalAlignment  One of the verticalAlignments enum values
		 * @param  {Boolean}         isDryRun           Whether this is a dry run and should not persist changes to the internal model
		 * @param  {BlueprintRange}  selectionRange     The selectionRange to change optionally
		 */
		return function setCellVerticalAlignment(tableGridModel, tableDefiningNode, blueprint, format, tableCells, verticalAlignment, isDryRun, selectionRange) {
			var structure = tableGridModel.tableStructure,
				clonedTableGridModel;

			if (!structure) {
				return false;
			}

			if (isDryRun) {
				clonedTableGridModel = tableGridModel.clone();
			}
			else {
				clonedTableGridModel = tableGridModel;
			}

			for (var i = 0, l = tableCells.length; i < l; ++i) {
				// Use a clone of the cell,
				// do not edit it directly
				var cell = clonedTableGridModel.getCellAtCoordinates(
					tableCells[i].origin.row,
					tableCells[i].origin.column);

				if (!cell) {
					return false;
				}

				cell.data.verticalAlignment = verticalAlignment;
			}

			return structure.applyToDom(
					clonedTableGridModel,
					tableDefiningNode,
					blueprint,
					format);
		};
	}
);
