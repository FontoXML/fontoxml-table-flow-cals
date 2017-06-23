define([
	'fontoxml-selectors/evaluateXPathToBoolean',
	'fontoxml-selectors/evaluateXPathToNodes',
	'fontoxml-selectors/evaluateXPathToNumber',
	'fontoxml-selectors/evaluateXPathToString',
	'fontoxml-table-flow',
	'fontoxml-table-flow/validateGridModel',

	'./getColumnSpecifications'
], function (
	evaluateXPathToBoolean,
	evaluateXPathToNodes,
	evaluateXPathToNumber,
	evaluateXPathToString,
	tableFlow,
	validateGridModel,

	getColumnSpecifications
) {
	'use strict';
	var TableGridBuilder = tableFlow.TableGridBuilder,
		normalizeGridModel = tableFlow.mutations.normalizeGridModel,
		computeWidths = tableFlow.utils.computeWidths;

	function getFrameAttribute (tgroupNode, blueprint) {
		// 'all' is the implied value of the FRAME attribute.
		return evaluateXPathToString(
			'let $frame := ./parent::*/@frame return if ($frame) then $frame else "all"',
			tgroupNode,
			blueprint);
	}

	function parseRowSpecifications (_rowIndex, rowNode, blueprint) {
		// TODO: Named object with constructor.
		return {
			valign: evaluateXPathToString('let $valign := ./@valign return if ($valign) then $valign else "bottom"', rowNode, blueprint)
		};
	}

	function getRowSpecifications (tgroup, blueprint, selectorParts) {
		var rowNodes = evaluateXPathToNodes(
				'./' + selectorParts.row +
				' | ./' + selectorParts.thead + '/' + selectorParts.row +
				' | ./' + selectorParts.tbody + '/' + selectorParts.row +
				' | ./' + selectorParts.tfoot + '/' + selectorParts.row
				, tgroup, blueprint),
			rowSpecs = [];

		for (var i = 0, l = rowNodes.length; i < l; ++i) {
			rowSpecs.push(parseRowSpecifications(i, rowNodes[i], blueprint));
		}

		return rowSpecs;
	}

	function setDataAttribute (data, name, value, columnSpecification) {
		if (value !== null) {
			data[name] = value;
		}
		else {
			// If there was no value supplied extract it from the column specifications.
			data[name] = columnSpecification[name];
		}

		return data;
	}

	function parseTableEntryElement (entryElement, columnIndex, columnSpecs, _rowIndex, _rowSpecs, oldColnamesToNewColnames, calsTableStructure, blueprint) {
		var data = Object.create(null);

		// We need to get the value of the colname attribute to determine the column the entry is in.
		// To determine horizontal size we need to look at the NAMEST and NAMEEND attributes.
		// And for vertical size we need to look at the MOREROWS attribute.
		var oldColName = evaluateXPathToString('./@colname', entryElement, blueprint),
			oldNamest = evaluateXPathToString('./@namest', entryElement, blueprint),
			oldNameend = evaluateXPathToString('./@nameend', entryElement, blueprint);

		var nameStart, nameEnd;

		if (oldColName !== '') {
			data.columnName = oldColnamesToNewColnames[oldColName];
		}
		else {
			data.columnName = 'column-' + columnIndex;
		}

		if (oldNamest !== '') {
			// NAMEST takes precedence over any COLNAME value.
			data.columnName = data.nameStart = nameStart = oldColnamesToNewColnames[oldNamest];
		}
		else {
			data.nameStart = nameStart = 'column-' + columnIndex;
		}

		if (oldNameend !== '') {
			data.nameEnd = nameEnd = oldColnamesToNewColnames[oldNameend];
		}
		else {
			data.nameEnd = nameEnd = 'column-' + columnIndex;
		}

		// MOREROWS: Specifies the number of additional rows to add in a vertical span.
		//   +1 to account for the starting row.
		var rowSpan = evaluateXPathToNumber('let $morerows := ./@morerows return if ($morerows) then number($morerows) + 1 else 1', entryElement, blueprint);

		// Set the attributes which could be respecified on the cell, overriding the colspecs
		var cellRowSep = evaluateXPathToString('./@rowsep', entryElement, blueprint);
		data = setDataAttribute(data, 'rowSeparator', cellRowSep === calsTableStructure.yesValue ? '1' : '0', columnSpecs[columnIndex]);

		var cellColSep = evaluateXPathToString('./@colsep', entryElement, blueprint);
		data = setDataAttribute(data, 'columnSeparator', cellColSep === calsTableStructure.yesValue ? '1' : '0', columnSpecs[columnIndex]);

		var cellAlign = evaluateXPathToString('./@align', entryElement, blueprint);
		data = setDataAttribute(data, 'horizontalAlignment', cellAlign, columnSpecs[columnIndex]);

		var cellValign = evaluateXPathToString('./@valign', entryElement, blueprint);
		data = setDataAttribute(data, 'verticalAlignment', cellValign, columnSpecs[columnIndex]);

		var cellOutputclass = evaluateXPathToString('./@outputclass', entryElement, blueprint);
		data = setDataAttribute(data, 'outputclass', cellOutputclass, columnSpecs[columnIndex]);

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
		builder.model.borders = frame !== 'none';

		// Get the column specifications for this table so we can set them on the cells
		//   for rendering purposes.
		var columnInfo = getColumnSpecifications(table, calsTableStructure, blueprint);

		var oldColnamesToNewColnames = columnInfo.oldColnamesToNewColnames,
			columnSpecifications = columnInfo.columnSpecifications;

		// Get the nodes we need for determining colspecifications.
		// For getting the row element we use specific lookups to support nested tables.
		// TODO: Why no lookup? this works?
		// TODO: Get specific elements, do not do a lookup.
		var rowElements = evaluateXPathToNodes('./' + calsTableStructure.selectorParts.row +
				' | ./' + calsTableStructure.selectorParts.thead + '/' + calsTableStructure.selectorParts.row +
				' | ./' + calsTableStructure.selectorParts.tbody + '/' + calsTableStructure.selectorParts.row +
				' | ./' + calsTableStructure.selectorParts.tfoot + '/' + calsTableStructure.selectorParts.row
				, table, blueprint);
		var rowSpecifications = getRowSpecifications(table, blueprint, calsTableStructure.selectorParts);

		builder.model.rowSpecifications = rowSpecifications;
		builder.model.columnSpecifications = columnSpecifications;

		// Create the TableCell objects and fill the TableGridModel.
		for (var row = 0, length = rowElements.length; row < length; row++) {
			builder.newRow();
			var rowElement = rowElements[row];

			var rowEntries = evaluateXPathToNodes('./child::' + calsTableStructure.selectorParts.entry, rowElement, blueprint);

			// See if this a headerRow
			if (evaluateXPathToBoolean('./parent::' + calsTableStructure.selectorParts.thead, rowElement, blueprint)) {
				builder.model.headerRowCount += 1;
			}

			var columnIndex = 0;

			rowEntries.forEach(function (entry) {
				var parsedCell = parseTableEntryElement(
					entry,
					columnIndex,
					columnSpecifications,
					row,
					rowSpecifications,
					oldColnamesToNewColnames,
					calsTableStructure,
					blueprint);

				builder.newCell(entry, parsedCell.data, parsedCell.rowSpan, parsedCell.colSpan);
				columnIndex += parsedCell.colSpan;
			});
		}

		normalizeGridModel(builder.model);

		validateGridModel(builder);

		computeWidths(builder.model);

		return builder.model;
	};
});
