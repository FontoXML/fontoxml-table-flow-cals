define(
	[
		'fontoxml-dom-utils',

		'fontoxml-table-flow',

		'./getColumnSpecifications'
	],
	function (
		domUtils,

		tableFlow,

		getColumnSpecifications
		) {
		'use strict';
		var domQuery = domUtils.domQuery,
			domInfo = domUtils.domInfo,
			TableGridBuilder = tableFlow.TableGridBuilder,
			computeWidths = tableFlow.utils.computeWidths;

		function getFrameAttribute (tgroupNode) {
			var tableNode = tgroupNode.parentNode,
				frameAttribute = tableNode.getAttribute('frame');

			// 'all' is the implied value of the FRAME attribute.
			return frameAttribute || 'all';
		}

		function parseRowSpecifications(rowIndex, rowNode) {
			// TODO: Named object with constructor.
			return {
				'valign': rowNode.getAttribute('valign') || 'bottom'
			};
		}

		function getRowSpecifications(tgroup) {
			var rowNodes = domQuery.findDescendants(tgroup, 'row', false),
				rowSpecs = [];

			for (var i = 0, l = rowNodes.length; i < l; ++i) {
				rowSpecs.push(parseRowSpecifications(i, rowNodes[i]));
			}

			return rowSpecs;
		}

		function setDataAttribute (data, name, value, columnSpecification) {
			if (value !== null) {
				data[name] = value;
			} else {
				// If there was no value supplied extract it from the column specifications.
				data[name] = columnSpecification[name];
			}

			return data;
		}

		function parseTableEntryElement (entryElement, columnIndex, columnSpecs, rowIndex, rowSpecs, oldColnamesToNewColnames) {
			var data = Object.create(null);

			// We need to get the value of the colname attribute to determine the column the entry is in.
			// To determine horizontal size we need to look at the NAMEST and NAMEEND attributes.
			// And for vertical size we need to look at the MOREROWS attribute.
			var oldColName = entryElement.getAttribute('colname'),
				oldNamest = entryElement.getAttribute('namest'),
				oldNameend = entryElement.getAttribute('nameend');

			var columnName, nameStart, nameEnd;

			if (oldColName) {
				data.columnName = columnName = oldColnamesToNewColnames[oldColName];
			} else {
				data.columnName = columnName = 'column-' + columnIndex;
			}

			if (oldNamest) {
				// NAMEST takes precedence over any COLNAME value.
				data.columnName = columnName = data.nameStart = nameStart = oldColnamesToNewColnames[oldNamest];
			} else {
				data.nameStart = nameStart = 'column-' + columnIndex;
			}

			if (oldNameend) {
				data.nameEnd = nameEnd = oldColnamesToNewColnames[oldNameend];
			} else {
				data.nameEnd = nameEnd = 'column-' + columnIndex;
			}

			// MOREROWS: Specifies the number of additional rows to add in a vertical span.
			//   +1 to account for the starting row.
			var rowSpan = parseInt(entryElement.getAttribute('morerows') || 0, 10) + 1;

			// Set the attributes which could be respecified on the cell, overriding the colspecs
			var cellRowSep = entryElement.getAttribute('rowsep');
			data = setDataAttribute(data, 'rowSeparator', cellRowSep, columnSpecs[columnIndex]);

			var cellColSep = entryElement.getAttribute('colsep');
			data = setDataAttribute(data, 'columnSeparator', cellColSep, columnSpecs[columnIndex]);

			var cellAlign = entryElement.getAttribute('align');
			data = setDataAttribute(data, 'alignment', cellAlign, columnSpecs[columnIndex]);

			var cellVerticalAlignment = entryElement.getAttribute('valign');
			data = setDataAttribute(data, 'verticalAlignment', cellVerticalAlignment, columnSpecs[columnIndex]);

			// Calculate the colspan
			var endColumnName = nameEnd,
				startColumnName = nameStart,
				// A column always spans atleast 1 column.
				colSpan = 1;
			// First, look to the starting column of this cell
			var i, l;
			for (i = columnIndex, l = columnSpecs.length; i < l; ++i) {
				if (columnSpecs[i].columnName === startColumnName) {
					columnIndex = i;
					break;
				}
			}

			for (i = columnIndex, l = columnSpecs.length; i < l; ++i) {
				if (columnSpecs[i].columnName === endColumnName) {
					colSpan += i - columnIndex;
					break;
				}
			}

			return {
				data: data,
				rowSpan: rowSpan,
				colSpan: colSpan
			};
	}

		function validateGridModel (builder) {
			// Loop over all the cells. If one is null, the table is semantically invalid. This is not supported
			for (var i = 0, l = builder.model.getHeight(); i < l; ++i) {
				for (var j = 0, k = builder.model.getWidth(); j < k; ++j) {
					if (!builder.model.getCellAtCoordinates(i, j)) {
						throw new Error('Semantically incorrect tables are not supported.' +
							'The colspans / rowspans of this table do not add up!' +
							'There was no cell at location: ' + i + ', ' + j);
					}
				}
			}
		}

		/**
		 * Build a generic gridModel from the CALS table
		 *
		 * @param   {CalsTableStructure}  calsTableStructure  The CalsTableStructure to use to build the gridModel with
		 * @param   {Node}                tableElement        The root of the table
		 *
		 * @return  {GridModel}           The build gridModel
		 */
		return function buildGridModel (calsTableStructure, tableElement) {
			// TODO: perform repairs as necessary, the hook should ensure this is called within an active transaction

			// Table in this case is the <tgroup> element.
			var table = tableElement,
				builder = new TableGridBuilder(calsTableStructure);

			// Get the frame attribute from the <table> element that contains the <tgroup>.
			//    This determines if the table has (a) border(s).
			var frame = getFrameAttribute(table);
			// TODO: Expand the .borders so it is both abstract and can contain all different options.
			builder.model.borders = frame !== 'none' ? true : false;

			// Get the column specifications for this table so we can set them on the cells
			//   for rendering purposes.
			var columnInfo = getColumnSpecifications(table);

			var oldColnamesToNewColnames = columnInfo.oldColnamesToNewColnames,
				columnSpecifications = columnInfo.columnSpecifications;

			// Get the nodes we need for determining colspecifications.
			// For getting the row element we use specific lookups to support nested tables.
			// TODO: Why no lookup? this works?
			var rowElements = domQuery.findDescendants(table, 'row', false); //TODO: Get specific elements, do not do a lookup.

			var rowSpecifications = getRowSpecifications(table);

			builder.model.rowSpecifications = rowSpecifications;
			builder.model.columnSpecifications = columnSpecifications;

			// Create the TableCell objects and fill the TableGridModel.
			for (var row = 0, length = rowElements.length; row < length; row++) {

				builder.newRow();
				var rowElement = rowElements[row];

				var rowEntries = domQuery.findChildren(rowElement, 'entry');

				// See if this a headerRow
				if (domInfo.isElement(rowElement.parentNode, 'thead')) {
					builder.model.headerRowCount += 1;
				}

				var columnIndex = 0;

				for (var i = 0, l = rowEntries.length; i < l; i++) {
					var entry = rowEntries[i],
						data = {},
						colspan = 0,
						colFromColspec;

					var parsedCell = parseTableEntryElement(
						entry,
						columnIndex,
						columnSpecifications,
						row,
						rowSpecifications,
						oldColnamesToNewColnames);

					builder.newCell(entry, parsedCell.data, parsedCell.rowSpan, parsedCell.colSpan);
					columnIndex += parsedCell.colSpan;
				}

			}
			validateGridModel(builder);

			computeWidths(builder.model);


			return builder.model;
		};

	}
);
