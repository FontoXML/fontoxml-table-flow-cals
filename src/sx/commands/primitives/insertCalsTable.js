define([
	'fontoxml-base-flow',
	'fontoxml-blueprints',
	'fontoxml-dom-identification/getNodeId',
	'fontoxml-operations/operationsManager',
	'fontoxml-table-flow',

	'../../../calsTableStructure'
], function (
	baseFlow,
	blueprints,
	getNodeId,
	operationsManager,
	tableFlow,

	calsTableStructure
	) {
	'use strict';

	var createNewTable = calsTableStructure.getNewTableCreater();

	var insertNodes = baseFlow.primitives.insertNodes,
		tableGridModelLookupSingleton = tableFlow.tableGridModelLookupSingleton;

	return function insertCalsTable (argument, blueprintPosition, blueprint, format) {
		var ownerDocument = blueprintPosition.container.ownerDocument,
			tableGridModel = createNewTable(argument.rows, argument.columns, argument.hasHeader, ownerDocument),
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

		tableGridModelLookupSingleton.addToLookup(tgroupNode, tableGridModel, true);

		argument.tableNodeId = getNodeId(tgroupNode);

		return true;
	};
});

