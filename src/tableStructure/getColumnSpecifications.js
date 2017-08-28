define([
	'fontoxml-selectors/evaluateXPathToBoolean',
	'fontoxml-selectors/evaluateXPathToNodes',
	'fontoxml-selectors/evaluateXPathToNumber',
	'fontoxml-selectors/evaluateXPathToString',
	'fontoxml-table-flow'
], function (
	evaluateXPathToBoolean,
	evaluateXPathToNodes,
	evaluateXPathToNumber,
	evaluateXPathToString,
	tableFlow
) {
	'use strict';

	var ColumnSpecification = tableFlow.ColumnSpecification;

	function generateColumnSpecification (columnIndex) {
		return new ColumnSpecification(
				null,
				'column-' + (columnIndex),
				columnIndex,
				null,
				// 1* is the implied columnwidth value (https://www.oasis-open.org/specs/a502.htm)
				'1*',
				null,
				'*',
				true,
				null);
	}

	function getUnitOfWidth (colSpecNode, blueprint) {
		// 1* is the implied value (https://www.oasis-open.org/specs/a502.htm)
		var colWidth = evaluateXPathToString('let $colwidth := ./@colwidth return if ($colwidth) then $colwidth else "1*"', colSpecNode, blueprint);

		// Get the part after any digits and an optional dot.
		var unit = colWidth.match(/[\d.]*(.*)$/);
		return unit ? unit[1] : '';
	}

	function parseColumnSpecification (columnIndex, colSpec, blueprint, tableStructure) {
		// This is the implied value when COLWIDTH is set as null or not present.
		var columnWidth = evaluateXPathToString('let $colwidth := ./@colwidth return if ($colwidth) then $colwidth else "1*"', colSpec, blueprint),
			isProportion;

		// @TODO: Add support for mixed values such as 121*+3px.
		if (columnWidth.indexOf('+') !== -1) {
			// For now we only use the first value of a mixed width value
			columnWidth = columnWidth.split('+')[0];
			isProportion = false;
		}

		if (columnWidth.indexOf('*') !== -1) {
			// If the colwidth contains a '*' we are working with a proportional width.
			isProportion = true;
		}

		var unitOfWidth = getUnitOfWidth(colSpec, blueprint);

		var hasColumnSeparator = evaluateXPathToBoolean('not(./@colsep = "' + tableStructure.noValue + '")', colSpec, blueprint),
			hasRowSeparator = evaluateXPathToBoolean('not(./@rowsep = "' + tableStructure.noValue + '")', colSpec, blueprint),
			alignment = evaluateXPathToString('./@align', colSpec, blueprint);

		return new ColumnSpecification(
				alignment,
				'column-' + (columnIndex),
				columnIndex,
				hasColumnSeparator,
				columnWidth,
				hasRowSeparator,
				unitOfWidth,
				isProportion,
				evaluateXPathToString('./@colname', colSpec, blueprint));
	}

	return function getColumnSpecifications (tgroup, tableStructure, blueprint) {
		// COLS is a required attribute.
		var columnCount = evaluateXPathToNumber('./@cols => number()', tgroup, blueprint),
			colspecs = evaluateXPathToNodes('./child::' + tableStructure.selectorParts.colspec, tgroup, blueprint);

		var columnSpecifications = [],
			oldColnamesToNewColnames = {},
			previousColnum = 0;

		// We used to generate non-standard colspecs, starting a 0. This is not right, according to spec.
		var colnumsStartWith0 = colspecs[0] && evaluateXPathToBoolean('./@colnum = "0"', colspecs[0], blueprint);

		for (var columnIndex = 0; columnIndex < columnCount; columnIndex++) {
			var columnSpecElement = colspecs[columnIndex];

			if (!columnSpecElement) {
				columnSpecifications[columnIndex] = generateColumnSpecification(columnIndex, blueprint);
				continue;
			}

			var columnNumber = evaluateXPathToNumber('number(./@colnum) - 1', columnSpecElement, blueprint);
			if (!Number.isNaN(columnNumber)) {
				if (colnumsStartWith0) {
					// This table is generated not according to spec. The colnums should be considered as off by one: starting at 0 instead of 1.
					columnNumber += 1;
				}

				if (columnNumber < previousColnum) {
					throw new Error('Out of order columns in a colspec are not supported');
				}

				previousColnum = columnNumber;

				while (columnNumber - 1 > columnIndex) {
					// Generate missing colspecs.
					columnSpecifications[columnIndex] = generateColumnSpecification(columnIndex);

					columnIndex++;
				}
			}

			// Just parse as is
			columnSpecifications[columnIndex] = parseColumnSpecification(columnIndex, columnSpecElement, blueprint, tableStructure);
		}

		for (var i = 0, l = columnSpecifications.length; i < l; ++i) {
			oldColnamesToNewColnames[columnSpecifications[i].oldColumnName] = columnSpecifications[i].columnName;
		}

		return {
			oldColnamesToNewColnames: oldColnamesToNewColnames,
			columnSpecifications: columnSpecifications
		};
	};
});
