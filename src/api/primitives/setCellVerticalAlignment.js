define([
		'fontoxml-dom-identification',

		'../../TableCell',
		'../../TableGridModelLookupSingleton'
	],
	function(
		domIdentification,

		TableCell,
		tableGridModelLookupSingleton
		) {
		'use strict';

		var getNodeId = domIdentification.getNodeId,
			structures = tableGridModelLookupSingleton.tableStructures;

		/**
		 * Set the vertical alignment of a single cell in a cals table
		 *
		 * @param  {TableGridModel}  tableGridModel     The tableGridModel to use for the table
		 * @param  {Blueprint}       blueprint          The blueprint in which to perform the table mutation
		 * @param  {Format}          format             The format to use for validation
		 * @param  {number}          rowIndex           The roIndex of the cell to adjust
		 * @param  {number}          columnIndex        The columnIndex of the cell to adjust
		 * @param  {string}          verticalAlignment  One of the verticalAlignments enum values
		 * @param  {Boolean}         isDryRun           Whether this is a dry run and should not persist changes to the internal model
		 * @param  {BlueprintRange}  selectionRange     The selectionRange to change optionally
		 */
		return function setCellVerticalAlignment(tableGridModel, tableDefiningNode, blueprint, format, rowIndex, columnIndex, verticalAlignment, isDryRun, selectionRange) {
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

			var cell = clonedTableGridModel.getCellAtCoordinates(rowIndex, columnIndex);

			if (!cell) {
				return false;
			}

			cell.data.verticalAlignment = verticalAlignment;

			var succes = structure.applyToDom(
					clonedTableGridModel,
					tableDefiningNode,
					blueprint,
					format);

			if (!succes) {
				return false;
			}

			//Set the selection
			selectionRange.setStart(cell.element, 0);
			selectionRange.collapse(true);

			return true;
		};
	}
);