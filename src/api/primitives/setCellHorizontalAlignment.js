define([
		'fontoxml-dom-identification',
	],
	function(
		domIdentification
		) {
		'use strict';

		var getNodeId = domIdentification.getNodeId;

		/**
		 * Set the horizontal alignment of a single cell in a cals table
		 *
		 * @param  {Array[TableGridModel]}  tableGridModels    The tableGridModels to use for the tables
		 * @param  {Blueprint}              blueprint          The blueprint in which to perform the table mutation
		 * @param  {Format}                 format             The format to use for validation
		 * @param  {Array[TableCell]}       tableCells         The table cells to adjust
		 * @param  {string}                 horizontalAlignment  One of the horizontalAlignments enum values
		 * @param  {Boolean}                isDryRun           Whether this is a dry run and should not persist changes to the internal model
		 */
		return function setCellHorizontalAlignment(tableGridModels, tableDefiningNodes, blueprint, format, tableCells, horizontalAlignment, isDryRun) {
			var clonedTableGridModels = [],
				structures = [];
			for (var index = 0, length = tableCells.length; index < length; ++index) {
				var tableGridModel = tableGridModels[index],
					structure = tableGridModel.tableStructure,
					clonedTableGridModel;

				if (!structure) {
					return false;
				}

				structures.push(structure);

				if (isDryRun) {
					clonedTableGridModel = tableGridModel.clone();
				}
				else {
					clonedTableGridModel = tableGridModel;
				}

				clonedTableGridModels.push(clonedTableGridModel);

				var rowIndex = tableCells[index].origin.row,
					columnIndex = tableCells[index].origin.column,
					cell = clonedTableGridModel.getCellAtCoordinates(rowIndex, columnIndex);

				if (!cell) {
					return false;
				}

				cell.data.alignment = horizontalAlignment;
			}

			var tablesThatHaveBeenAppliedToDom = [];
			for (var i = 0, l = clonedTableGridModels.length; i < l; ++i) {
				if (tablesThatHaveBeenAppliedToDom.indexOf(tableDefiningNodes[i]) !== -1) {
					continue;
				}
				var succes = structures[i].applyToDom(
						clonedTableGridModels[i],
						tableDefiningNodes[i],
						blueprint,
						format);

				tablesThatHaveBeenAppliedToDom.push(tableDefiningNodes[i]);

				if (!succes) {
					return false;
				}
			}

			return true;
		};
	}
);
