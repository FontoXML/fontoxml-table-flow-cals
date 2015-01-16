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

		function getUnitOfWidth (colSpecNode, blueprint) {
			var colWidth = blueprint.getAttribute(colSpecNode, 'colwidth');

			if (!colWidth) {
				colWidth = '1*'; // 1* is the implied value (https://www.oasis-open.org/specs/a502.htm)
			}

			// Get the part after any digits and an optional dot.
			var unit = colWidth.match(/[\d.]*(.*)$/);
			return unit ? unit[1] : '';
		}

		function parseColumnSpecification (columnIndex, colSpec, blueprint) {
			// This is the implied value when COLWIDTH is set as null or not present.
			var columnWidth = blueprint.getAttribute(colSpec, 'colwidth') || '1*',
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

			var columnSeparator = blueprint.getAttribute(colSpec, 'colsep'),
				rowSeparator = !!blueprint.getAttribute(colSpec, 'rowsep') || true,
				alignment = !!blueprint.getAttribute(colSpec, 'align') || true;

			return new ColumnSpecification(
					alignment,
					'column-' + (columnIndex),
					columnIndex,
					columnSeparator,
					columnWidth,
					rowSeparator,
					unitOfWidth,
					isProportion,
					blueprint.getAttribute(colSpec, 'colname'));
		}

		return function getColumnSpecifications (tgroup, blueprint) {
			// COLS is a required attribute.
			var columnCount = parseInt(blueprint.getAttribute(tgroup, 'cols'), 10);

			var colspecs = [];

			// Loop over the children of the TGROUP then add the COLSPECs to the array.
			//   This is done to accomodate for nested tables.
			for (var potentialColspec = blueprint.getFirstChild(tgroup);
				 potentialColspec;
				 potentialColspec = blueprint.getNextSibling(potentialColspec)) {
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
					columnSpecifications[columnIndex] = generateColumnSpecification(columnIndex, blueprint);
					continue;
				}

				var columnNumber = blueprint.getAttribute(columnSpecElement, 'colnum');
				if (columnNumber) {
					columnNumber = parseInt(columnNumber, 10);

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
				columnSpecifications[columnIndex] = parseColumnSpecification(columnIndex, columnSpecElement, blueprint);
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
