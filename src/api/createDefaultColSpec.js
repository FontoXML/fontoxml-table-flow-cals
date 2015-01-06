define(
	[
		'fontoxml-table-flow'
	],
	function (
		tableFlow
		) {
		'use strict';

		var ColumnSpecification = tableFlow.ColumnSpecification;

		return function createDefaultColspec (columnIndex) {

			return new ColumnSpecification(
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
	}
);
