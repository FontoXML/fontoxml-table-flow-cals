define(
	[
		'fontoxml-dom-utils',

		'fontoxml-table-flow'
	],
	function (
		domUtils,

		tableFlow
		) {
		'use strict';

		var domQuery = domUtils.domQuery,
			domInfo = domUtils.domInfo,
			ColumnSpecification = tableFlow.ColumnSpecification;

		function generateColumnSpecification (columnIndex) {
			return new ColumnSpecification(
					null,
					'column-' + (columnIndex),
					columnIndex,
					null,
					'1*', // 1* is the implied columnwidth value (https://www.oasis-open.org/specs/a502.htm)
					null,
					'*',
					true,
					null);
		}

		function getUnitOfWidth (colSpecNode) {
			var colWidth = colSpecNode.getAttribute('colwidth');

			if (!colWidth) {
				colWidth = '1*'; // 1* is the implied value (https://www.oasis-open.org/specs/a502.htm)
			}

			// Get the part after any digits and an optional dot.
			var unit = colWidth.match(/[\d.]*(.*)$/);
			return unit ? unit[1] : '';
		}

		function parseColumnSpecification (columnIndex, colSpec) {
			// This is the implied value when COLWIDTH is set as null or not present.
			var columnWidth = colSpec.getAttribute('colwidth') || '1*',
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

			var unitOfWidth = getUnitOfWidth(colSpec);

			var columnSeparator = colSpec.getAttribute('colsep'),
				rowSeparator = !!colSpec.getAttribute('rowsep') || true,
				alignment = !!colSpec.getAttribute('align') || true;

			return new ColumnSpecification(
					alignment,
					'column-' + (columnIndex),
					columnIndex,
					columnSeparator,
					columnWidth,
					rowSeparator,
					unitOfWidth,
					isProportion,
					colSpec.getAttribute('colname'));
		}

		return function getColumnSpecifications (tgroup) {
			// COLS is a required attribute.
			var columnCount = parseInt(tgroup.getAttribute('cols'));

			var colspecs = [];

			// Loop over the children of the TGROUP then add the COLSPECs to the array.
			//   This is done to accomodate for nested tables.
			for (var index = 0, length = tgroup.childNodes.length; index < length; ++index) {
				var potentialColspec = tgroup.childNodes[index];
				if (domInfo.isElement(potentialColspec, 'colspec')) {
					colspecs.push(potentialColspec);
				}
			}

			var columnSpecifications = [],
				oldColnamesToNewColnames = {};

			var previousColnum = 0;

			for (var columnIndex = 0; columnIndex < columnCount; columnIndex++) {
				var columnSpec;
				var columnSpecElement = colspecs[columnIndex];

				if (!columnSpecElement) {
					columnSpecifications[columnIndex] = generateColumnSpecification(columnIndex);
					continue;
				}

				var columnNumber = columnSpecElement.hasAttribute('colnum');
				if (columnNumber) {

					columnNumber = columnSpecElement.getAttribute('colnum');

					if (columnNumber < previousColnum) {
						throw new Error('Out of order columns in a colspec are not supported');
					}

					previousColnum = columnNumber;

					while (columnNumber - 1 > columnIndex) {
						// Generate missing colspecs.
						columnSpecifications[columnIndex] = generateColumnSpecification(columnIndex);

						columnIndex ++;
					}
				}

				// Just parse as is
				columnSpecifications[columnIndex] = parseColumnSpecification(columnIndex, columnSpecElement);
			}

			for (var i = 0, l = columnSpecifications.length; i < l; ++i) {
				oldColnamesToNewColnames[columnSpecifications[i].oldColumnName] = columnSpecifications[i].columnName;
			}

			return {
				oldColnamesToNewColnames: oldColnamesToNewColnames,
				columnSpecifications: columnSpecifications
			};
		};
	}
);
