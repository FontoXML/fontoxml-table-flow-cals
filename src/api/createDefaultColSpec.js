define([
	'fontoxml-table-flow/tableManager'
], function (
	tableManager
	) {
	'use strict';

	return function createDefaultColspec (columnIndex) {

		return tableManager.createColumnSpecification(
				null, //alignment
				'column-' + columnIndex, //columnName
				columnIndex, //columnNumber
				true, //columnSeparator
				'1*', //columnWidth
				true, //rowSeparator
				'*', //unitOfWidth
				null, //isProportion
				null //oldColumnName
			);

	};
});
