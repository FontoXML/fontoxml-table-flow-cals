define([
	'fontoxml-blueprints',
	'fontoxml-dom-utils/domInfo',
	'fontoxml-table-flow',

	'./sx/getColumnSpecifications'
], function (
	blueprints,
	domInfo,
	tableFlow,

	getColumnSpecifications
	) {
	'use strict';
	var blueprintQuery = blueprints.blueprintQuery,
		TableGridBuilder = tableFlow.TableGridBuilder,
		normalizeGridModel = tableFlow.mutations.normalizeGridModel,
		computeWidths = tableFlow.utils.computeWidths;

	function getFrameAttribute (tgroupNode, blueprint) {
		var tableNode = blueprint.getParentNode(tgroupNode),
			frameAttribute = blueprint.getAttribute(tableNode, 'frame');

		// 'all' is the implied value of the FRAME attribute.
		return frameAttribute || 'all';
	}

	function parseRowSpecifications (rowIndex, rowNode, blueprint) {
		// TODO: Named object with constructor.
		return {
			'valign': blueprint.getAttribute(rowNode, 'valign') || 'bottom'
		};
	}

	function getRowSpecifications (tgroup, blueprint) {
		var rowNodes = blueprintQuery.findDescendants(blueprint, tgroup, 'row', false),
			rowSpecs = [];

		for (var i = 0, l = rowNodes.length; i < l; ++i) {
			rowSpecs.push(parseRowSpecifications(i, rowNodes[i], blueprint));
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

	function parseTableEntryElement (entryElement, columnIndex, columnSpecs, rowIndex, rowSpecs, oldColnamesToNewColnames, blueprint) {
		var data = Object.create(null);

		// We need to get the value of the colname attribute to determine the column the entry is in.
		// To determine horizontal size we need to look at the NAMEST and NAMEEND attributes.
		// And for vertical size we need to look at the MOREROWS attribute.
		var oldColName = blueprint.getAttribute(entryElement, 'colname'),
			oldNamest = blueprint.getAttribute(entryElement, 'namest'),
			oldNameend = blueprint.getAttribute(entryElement, 'nameend');

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
		var rowSpan = parseInt(blueprint.getAttribute(entryElement, 'morerows') || 0, 10) + 1;

		// Set the attributes which could be respecified on the cell, overriding the colspecs
		var cellRowSep = blueprint.getAttribute(entryElement, 'rowsep');
		data = setDataAttribute(data, 'rowSeparator', cellRowSep, columnSpecs[columnIndex]);

		var cellColSep = blueprint.getAttribute(entryElement, 'colsep');
		data = setDataAttribute(data, 'columnSeparator', cellColSep, columnSpecs[columnIndex]);

		var cellAlign = blueprint.getAttribute(entryElement, 'align');
		data = setDataAttribute(data, 'alignment', cellAlign, columnSpecs[columnIndex]);

		var cellVerticalAlignment = blueprint.getAttribute(entryElement, 'valign');
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
	 * @param   {Blueprint}           blueprint           The blueprint in which to consider the table
	 *
	 * @return  {GridModel}           The build gridModel
	 */
	return function buildGridModel (calsTableStructure, tableElement, blueprint) {
		// TODO: perform repairs as necessary, the hook should ensure this is called within an active transaction

		// Table in this case is the <tgroup> element.
		var table = tableElement,
			builder = new TableGridBuilder(calsTableStructure);

		// Get the frame attribute from the <table> element that contains the <tgroup>.
		//    This determines if the table has (a) border(s).
		var frame = getFrameAttribute(table, blueprint);
		// TODO: Expand the .borders so it is both abstract and can contain all different options.
		builder.model.borders = frame !== 'none' ? true : false;

		// Get the column specifications for this table so we can set them on the cells
		//   for rendering purposes.
		var columnInfo = getColumnSpecifications(table, blueprint);

		var oldColnamesToNewColnames = columnInfo.oldColnamesToNewColnames,
			columnSpecifications = columnInfo.columnSpecifications;

		// Get the nodes we need for determining colspecifications.
		// For getting the row element we use specific lookups to support nested tables.
		// TODO: Why no lookup? this works?
		var rowElements = blueprintQuery.findDescendants(blueprint, table, 'row', false); //TODO: Get specific elements, do not do a lookup.

		var rowSpecifications = getRowSpecifications(table, blueprint);

		builder.model.rowSpecifications = rowSpecifications;
		builder.model.columnSpecifications = columnSpecifications;

		// Create the TableCell objects and fill the TableGridModel.
		for (var row = 0, length = rowElements.length; row < length; row++) {
			builder.newRow();
			var rowElement = rowElements[row];

			var rowEntries = blueprintQuery.findChildren(blueprint, rowElement, 'entry');

			// See if this a headerRow
			if (domInfo.isElement(blueprint.getParentNode(rowElement), 'thead')) {
				builder.model.headerRowCount += 1;
			}

			var columnIndex = 0;

			for (var i = 0, l = rowEntries.length; i < l; i++) {
				var entry = rowEntries[i],
					parsedCell = parseTableEntryElement(
						entry,
						columnIndex,
						columnSpecifications,
						row,
						rowSpecifications,
						oldColnamesToNewColnames,
						blueprint);

				builder.newCell(entry, parsedCell.data, parsedCell.rowSpan, parsedCell.colSpan);
				columnIndex += parsedCell.colSpan;
			}
		}

		normalizeGridModel(builder.model);

		validateGridModel(builder);

		computeWidths(builder.model);

		return builder.model;
	};
});

