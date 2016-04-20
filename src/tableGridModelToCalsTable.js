define([
	'fontoxml-blueprints',
	'fontoxml-dom-identification/getNodeId',
	'fontoxml-dom-utils/domInfo'
], function (
	blueprints,
	getNodeId,
	domInfo
	) {
	'use strict';

	var blueprintQuery = blueprints.blueprintQuery,
		unsafeMoveNodes = blueprints.blueprintMutations.unsafeMoveNodes;

	function createNewRow (parentElement, blueprint) {
		var row = parentElement.ownerDocument.createElement('row');
		blueprint.appendChild(parentElement, row);
		return row;
	}

	// Remove existing colspecs and re-make them based on the gridModel
	function mergeColspecs (tgroupNode, columnSpecifications, blueprint) {
		for (var colspecNode = blueprintQuery.findChild(blueprint, tgroupNode, 'colspec');
			colspecNode;
			colspecNode = blueprintQuery.findChild(blueprint, tgroupNode, 'colspec')) {

			blueprint.removeChild(tgroupNode, colspecNode);
		}

		var originalFirstChild = blueprint.getFirstChild(tgroupNode);

		for (var colSpecIndex = 0, colSpecCount = columnSpecifications.length;
			colSpecIndex < colSpecCount;
			++ colSpecIndex) {

			var columnSpecification = columnSpecifications[colSpecIndex];

			var colName = columnSpecification.columnName;

			var newColspec = tgroupNode.ownerDocument.createElement('colspec');
			blueprint.insertBefore(tgroupNode, newColspec, originalFirstChild);

			// These options are optional, but we will always fill them for completeness sake.
			// They are used heavily in rendering
			newColspec.setAttribute('colname', colName);
			newColspec.setAttribute('colnum', columnSpecification.columnNumber);
			newColspec.setAttribute('colwidth', columnSpecification.columnWidth);

			// The following are optional
			var colSeparators = columnSpecification.columnSeparators ? '1' : '0',
				rowSeparators = columnSpecification.rowSeparators ? '1' : '0';

			newColspec.setAttribute('colsep', colSeparators);

			newColspec.setAttribute('rowsep', rowSeparators);

			if (columnSpecification.alignment) {
				newColspec.setAttribute('align', columnSpecification.alignment);
			}
		}
	}

	/**
	 * Attempt to serialize the given table under the given tgroup
	 *
	 * @param   {TableGridModel}  tableGridModel  The tableGridModel to serialize
	 * @param   {Node}            tgroupNode      The TGroupNode to serialize the table under
	 * @param   {Blueprint}       blueprint       The blueprint to serialize in
	 * @param   {Format}          format          The format containing the validator and metadata to use
	 * @return  {boolean}         The success of the serialization. If true, the serialization took place in the given blueprint
	 */
	return function tableGridModelToCalsTable (tableGridModel, tgroupNode, blueprint, format) {
		blueprint.beginOverlay();
		var document = tgroupNode.ownerDocument;

		//  Set the frame attribute on the <table> node.
		var tableNode = blueprint.getParentNode(tgroupNode);
		if (tableNode && domInfo.isElement(tableNode, 'table')) {
			// TODO: Expand the .borders so it is both abstract and can contain all different options.
			var frame = tableGridModel.borders ? 'all' : 'none';

			blueprint.setAttribute(tableNode, 'frame', frame);
		}

		// Get the already existing rows in the table
		var tableHeaderNode = blueprintQuery.findChild(blueprint, tgroupNode, 'thead'),
			tableBodyNode = blueprintQuery.findChild(blueprint, tgroupNode, 'tbody') || blueprint.appendChild(tgroupNode, document.createElement('tbody')),
			headerRows = [],
			bodyRows = blueprintQuery.findDescendants(blueprint, tableBodyNode, 'row', false);

		if (tableHeaderNode) {
			headerRows = blueprintQuery.findDescendants(blueprint, tableHeaderNode, 'row', false);
		}

		var columnCount = tableGridModel.getWidth();

		// Set the cols attribute on the tgroup
		blueprint.setAttribute(tgroupNode, 'cols', columnCount);

		mergeColspecs(tgroupNode, tableGridModel.columnSpecifications, blueprint);

		// If the table is only 1 row high we can no longer use header cells.
		//   This is due to that fact that THEAD is optional and TBODY is required.
		if (tableGridModel.getHeight() == 1) {
			tableGridModel.headerRowCount = 0;
		}

		// Build a map containing all of the current rows
		var unseenRows = Object.create(null);
		for (var index = 0, height = headerRows.length + bodyRows.length;
			index < height;
			++index) {
			// If there are header rows we need to adjust the index for the lookup of the row.
			var bodyIndex = index - headerRows.length;

			var unseenRow = headerRows[index] || bodyRows[bodyIndex];

			// When deleting the only present header row unseenRow will actually be undefined.
			//    So we ensure thats not the case before adding it.
			if (unseenRow !== undefined) {
				unseenRows[getNodeId(unseenRow)] = unseenRow;
			}
		}

		if (tableGridModel.headerRowCount && !tableHeaderNode) {
			// We do not yet have a header, create one.
			tableHeaderNode = document.createElement('thead');
			blueprint.insertBefore(tgroupNode, tableHeaderNode, tableBodyNode);
		}

		var headerRowIndex = 0,
			bodyRowIndex = 0;
		// First: create the needed cells
		for (var rowIndex = 0, rowCount = tableGridModel.getHeight();
			rowIndex < rowCount;
			++rowIndex) {
			var row;
			if (rowIndex < tableGridModel.headerRowCount) {
				// If we are handling a header row
				row = headerRows[headerRowIndex];
				if (!row) {
					row = createNewRow(tableHeaderNode, blueprint);
					headerRows[headerRowIndex] = row;
				}

				headerRowIndex += 1;
			}
			else {
				row = bodyRows[bodyRowIndex];
				if (!row) {
					row = createNewRow(tableBodyNode, blueprint);
					bodyRows[bodyRowIndex] = row;
				}

				bodyRowIndex += 1;
			}

			if (unseenRows[getNodeId(row)]) {
				// This row still exists
				delete unseenRows[getNodeId(row)];
			}

			// Build a map containing all of the current entries of this row
			var unseenEntries = Object.create(null);
			for (var entry = blueprint.getFirstChild(row);
				entry;
				entry = blueprint.getNextSibling(entry)) {

				if (!domInfo.isElement(entry, 'entry')) {
					continue;
				}
				unseenEntries[getNodeId(entry)] = entry;
			}

			for (var columnIndex = 0;
				columnIndex < columnCount;
				++columnIndex) {

				var tableCell = tableGridModel.getCellAtCoordinates(rowIndex, columnIndex);

				if (tableCell.origin.row !== rowIndex) {
					// This cell spans from a previous row, thus should only be rendered there
					// Move the index to the end of the cell
					columnIndex += tableCell.size.columns - 1;
					continue;
				}

				if (unseenEntries[getNodeId(tableCell.element)]) {
					// This entry still exists under the current row
					delete unseenEntries[getNodeId(tableCell.element)];
				}


				var tableCellElement = tableCell.element;

				// Set the needed attributes on the element.
				var startColumn = tableGridModel.columnSpecifications[columnIndex];
				blueprint.setAttribute(tableCellElement, 'colname', startColumn.columnName);
				blueprint.setAttribute(tableCellElement, 'namest', startColumn.columnName);

				if (tableCell.size.rows !== 1) {
					// Set the morerows attribute, indicating rowSpans
					blueprint.setAttribute(tableCellElement, 'morerows', tableCell.size.rows - 1);
				}
				else if (blueprint.getAttribute(tableCellElement, 'morerows')) {
					// Remove the morerows attribute of the cell no longer has a span.
					blueprint.removeAttribute(tableCellElement, 'morerows');
				}

				// Set the optional attributes on the element.
				if (tableCell.data.rowSeparator) {
					blueprint.setAttribute(tableCellElement, 'rowsep', tableCell.data.rowSeparator);
				}
				else {
					var rowSep = startColumn.rowSeparators ? '1' : '0';
					blueprint.setAttribute(tableCellElement, 'rowsep', rowSep);
				}

				if (tableCell.data.columnSeparator) {
					blueprint.setAttribute(tableCellElement, 'colsep', tableCell.data.columnSeparator);
				}
				else {
					var colSep = startColumn.columnSeparators ? '1' : '0';
					blueprint.setAttribute(tableCellElement, 'colsep', colSep);
				}

				if (tableCell.data.verticalAlignment) {
					blueprint.setAttribute(tableCellElement, 'valign', tableCell.data.verticalAlignment);
				} else if (blueprint.getAttribute(tableCellElement, 'valign')) {
					// Remove the attribute if it was previously set but no longer present on the data object
					// of the TableCell.
					blueprint.removeAttribute(tableCellElement, 'valign');
				}

				if (tableCell.data.horizontalAlignment) {
					blueprint.setAttribute(tableCellElement, 'align', tableCell.data.horizontalAlignment);
				} else if (blueprint.getAttribute(tableCellElement, 'align')) {
					blueprint.removeAttribute(tableCellElement, 'align');
				}

				if (tableCell.data.outputclass) {
					blueprint.setAttribute(tableCellElement, 'outputclass', tableCell.data.outputclass);
				} else if (blueprint.getAttribute(tableCellElement, 'outputclass')) {
					blueprint.removeAttribute(tableCellElement, 'outputclass');
				}

				// Minus one to accommodate for the starting cell
				var endColumnSpecifications = tableGridModel.columnSpecifications[tableCell.origin.column + tableCell.size.columns - 1];
				blueprint.setAttribute(tableCellElement, 'nameend', endColumnSpecifications.columnName);

				// The cell may already be present at this location.
				//   unsafeMoveNodes it to prevent positions from being collapsed wrongly
				if (blueprint.getParentNode(tableCellElement)) {
					unsafeMoveNodes(tableCellElement, tableCellElement, blueprint, row, null, true);
				} else {
					blueprint.appendChild(row, tableCellElement);
				}

				// Move the index to the end of this possiby spanning cell
				columnIndex += tableCell.size.columns - 1;
			}

			// All of the entries which did not appear in the past row in the grid must be removed
			var unseenNodeIds = Object.keys(unseenEntries);
			for (var unseenNodeId = unseenNodeIds.pop(); unseenNodeId; unseenNodeId = unseenNodeIds.pop()) {

				// If the cell is still present in the table elsewhere, we do not have to remove it,
				//   It will be moved later on
				var cellIsStillPresent = !!tableGridModel.getCellByNodeId(unseenNodeId);
				if (!cellIsStillPresent) {
					blueprint.removeChild(row, unseenEntries[unseenNodeId]);
				}

				if (!blueprintQuery.findChild(blueprint, row, 'entry')) {
					// If the row is empty we need to remove it and update any spanning cells to accomodate for this change.
					//   This might occur when all cells in the above row are spanning into this one.
					// This is a valid table, but invalid CALS
					blueprint.removeChild(blueprint.getParentNode(row), row);
				}
			}
		}

		// All rows that did not appear in the grid must be removed.
		var unseenRowNodeIds = Object.keys(unseenRows);
		for (var unseenRowNodeId = unseenRowNodeIds.pop(); unseenRowNodeId; unseenRowNodeId = unseenRowNodeIds.pop()) {

			if (blueprint.getParentNode(unseenRows[unseenRowNodeId]).nodeName === 'thead') {
				blueprint.removeChild(tableHeaderNode, unseenRows[unseenRowNodeId]);
			}
			else if (blueprint.getParentNode(unseenRows[unseenRowNodeId]).nodeName === 'tbody') {
				blueprint.removeChild(tableBodyNode, unseenRows[unseenRowNodeId]);
			}
		}

		if (tableHeaderNode) {
			// Check if any of the actions taken resulted in an empty THEAD element and remove it if needed.
			if (!blueprintQuery.findChild(blueprint, tableHeaderNode, 'row')) {
				blueprint.removeChild(tgroupNode, tableHeaderNode);
			}
		}

		if (format.synthesizer.completeStructure(tgroupNode, blueprint)) {
			// The table is valid
			blueprint.applyOverlay();
			return true;
		}

		// The table is invalid
		blueprint.discardOverlay();
		return false;
	};
});
