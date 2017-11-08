define([
	'fontoxml-blueprints/readOnlyBlueprint',
	'fontoxml-dom-identification/getNodeId',
	'fontoxml-selectors/evaluateXPathToNodes',
	'fontoxml-families/determineCommonVisualizationOptions',
	'fontoxml-families/mapCommonVisualizationOptionsToCvAttributes',
	'fontoxml-table-flow',
	'fontoxml-templated-views'
], function (
	readOnlyBlueprint,
	getNodeId,
	evaluateXpathToNodes,
	determineCommonVisualizationOptions,
	mapCommonVisualizationOptionsToCvAttributes,
	tableFlow,
	templatedViews
) {
	'use strict';

	var DEFAULT_VISUALIZATION = {
			backgroundColor: 'grey',
			showWhen: 'always'
		};

	var tableGridModelLookupSingleton = tableFlow.tableGridModelLookupSingleton,
		Template = templatedViews.base.Template;

	function EntryTemplate () {
		Template.call(this);
	}

	EntryTemplate.prototype = Object.create(Template.prototype);
	EntryTemplate.prototype.constructor = EntryTemplate;

	function applyGridModelToViewNodeAttributes (cellViewNode, tableCell, tableGridModel, visualization) {
		var rowSep = '0',
			colSep = '0';

		// Default values according to those specified here: https://www.oasis-open.org/specs/a502.htm
		if (tableGridModel.cellsHaveBorders) {
			rowSep = tableCell.data.rowSeparator || '1';
			colSep = tableCell.data.columnSeparator || '1';
		}

		if (visualization.backgroundColor) {
			cellViewNode.setAttribute('cv-frame-background', visualization.backgroundColor);
		}
		if (visualization.showWhen) {
			cellViewNode.setAttribute('cv-show-when', visualization.showWhen);
		}

		cellViewNode.setAttribute('cv-table-row-separator', rowSep);
		cellViewNode.setAttribute('cv-table-column-separator', colSep);

		cellViewNode.setAttribute('cv-table-cell-horizontal-alignment', tableCell.data.horizontalAlignment || 'left');
		cellViewNode.setAttribute('cv-table-cell-vertical-alignment', tableCell.data.verticalAlignment || 'top');

		// Correct a previously proportional width into the width in percentages.
		// Conversion into the width in percentages has already been made, just need to adjust the unit of width.
		if (tableCell.data.width &&
			(tableCell.data.width.indexOf('*') !== -1 || tableCell.data.width.indexOf('%') !== -1)) {
			tableCell.data.width = tableCell.data.width.replace(/[^0-9\.]+/g, '') + '%';
		}
		cellViewNode.style.width = tableCell.data.width;

		cellViewNode.setAttribute('rowspan', tableCell.size.rows);
		cellViewNode.setAttribute('colspan', tableCell.size.columns);
	}

	EntryTemplate.prototype.render = function (nodeRenderer) {
		var tableGridModel = tableGridModelLookupSingleton.getGridModel(nodeRenderer.sourceNode),
			tableStructure = tableGridModel.tableStructure,
			tableCell = tableGridModel.getCellByNodeId(getNodeId(nodeRenderer.sourceNode)),
			isCellInHeaderRow = tableCell.origin.row < tableGridModel.headerRowCount,
			cellViewNode = nodeRenderer.viewDocumentNode.createElement(isCellInHeaderRow ? 'th' : 'td');

		// Note, because table-flow summarizes aspects of an entry, templated-views has no idea they might be changed.
		// Therefore, we need to manually introduce these dependencies.
		// Because we normalize all these aspects to the entry level, we only have to look at this level.
		var sourceNode = nodeRenderer.sourceNode;
		sourceNode.getAttribute('colname');
		sourceNode.getAttribute('namest');
		sourceNode.getAttribute('nameend');
		sourceNode.getAttribute('morerows');
		sourceNode.getAttribute('colsep');
		sourceNode.getAttribute('rowsep');
		sourceNode.getAttribute('align');
		sourceNode.getAttribute('valign');

		var visualization = Object.assign(
			{},
			DEFAULT_VISUALIZATION,
			determineCommonVisualizationOptions(sourceNode, nodeRenderer)
		);

		var finalVisualization = Object.assign(
			{},
			mapCommonVisualizationOptionsToCvAttributes(sourceNode, visualization),
			{
				'node-id': sourceNode.nodeId
			});

		// The table cell template also implicitly depends on the amount of logical columns, for computing widths
		var tGroupNode = sourceNode.findRelatedNodes(function (sourceNode) {
				return evaluateXpathToNodes('./ancestor::' + tableStructure.selectorParts.table, sourceNode, readOnlyBlueprint);
			})[0];
		tGroupNode.getAttribute('cols');

		applyGridModelToViewNodeAttributes(cellViewNode, tableCell, tableGridModel, visualization);

		Object.keys(finalVisualization).forEach(function (key) {
			cellViewNode.setAttribute(key, finalVisualization[key]);
		});

		nodeRenderer.appendViewNode(cellViewNode);
		nodeRenderer.traverse(cellViewNode);
	};

	return EntryTemplate;
});
