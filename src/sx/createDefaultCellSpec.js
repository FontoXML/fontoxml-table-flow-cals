define([
], function (
	) {
	'use strict';

	return function createDefaultCellspec (rowIndex, columnIndex, amountOfColumns) {
		// For a default cell specification we directly set a % width with a proportional (*) marker.
		var width = 100 / amountOfColumns;

		return {
			columnName: 'column-' + columnIndex,
			nameStart: 'column-' + columnIndex,
			nameEnd: 'column-' + columnIndex,
			width: width + '*'
		};
	};
});

