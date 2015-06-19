define([
	'fontoxml-base-flow',
	'fontoxml-blueprints',

	'fontoxml-table-flow/tableManager',
	'../calsTableStructure'
], function (
	baseFlow,
	blueprints,

	tableManager,

	calsTableStructure
	) {
	'use strict';

	var createNewTable = calsTableStructure.getNewTableCreater();

	var insertNodes = baseFlow.primitives.insertNodes,
		blueprintQuery = blueprints.blueprintQuery;

	return function insertCalsTable(hasHeader, rows, columns, blueprintPosition, blueprint, format, selectionRange) {

		var ownerDocument = blueprintPosition.container.ownerDocument;

		var tableGridModel = createNewTable(rows, columns, hasHeader, ownerDocument),
			tableNode = ownerDocument.createElement('table'),
			tgroupNode = ownerDocument.createElement('tgroup'),
			tbodyNode = ownerDocument.createElement('tbody');

		tgroupNode.appendChild(tbodyNode);
		tableNode.appendChild(tgroupNode);

		var succes = calsTableStructure.applyToDom(
			tableGridModel,
			tgroupNode,
			blueprint,
			format);

		if (!succes) {
			return false;
		}

		var insertSucces = insertNodes(blueprintPosition, [tableNode], blueprint, null, format);

		if (!insertSucces) {
			return false;
		}

		var tableGridModelLookup = tableManager.getTableGridModelLookup();

		tableGridModelLookup.addToLookup(tgroupNode, tableGridModel, true);

		//Set the selection
		var firstCell = blueprintQuery.findDescendants(blueprint, tableNode, 'entry')[0];
		selectionRange.setStart(firstCell, 0);
		selectionRange.collapse(true);

		return true;
	};
});
