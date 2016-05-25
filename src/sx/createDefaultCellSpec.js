define([
], function (
	) {
	'use strict';

	return function createDefaultCellspec (rowIndex, columnIndex, amountOfColumns) {
		// For a default cell specification we directly set a % width with a proportional (*) marker.
		var width = 100 / amountOfColumns;

		var cellspec = {
			width: width + '*'
		};

		if (amountOfColumns > 1) {
			cellspec.nameStart = 'column-' + columnIndex;
			cellspec.nameEnd = 'column-' + columnIndex;
		} else {
			cellspec.columnName = 'column-' + columnIndex;
		}

		return cellspec;
	};
});
