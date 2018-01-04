define([
	'fontoxml-dom-namespaces/namespaceManager',
	'fontoxml-selectors/evaluateXPathToFirstNode',

	'fontoxml-table-flow/TableDefinition',
	'fontoxml-table-flow/Width',

	'fontoxml-table-flow/normalizeContainerNodeStrategies',
	'fontoxml-table-flow/normalizeColumnSpecificationStrategies',

	'fontoxml-table-flow/getAttributeStrategies',

	'fontoxml-table-flow/setAttributeStrategies',

	'fontoxml-table-flow/createCreateRowStrategy',
	'fontoxml-table-flow/createCreateColumnSpecificationNodeStrategy'
], function (
	namespaceManager,
	evaluateXPathToFirstNode,

	TableDefinition,
	Width,

	normalizeContainerNodeStrategies,
	normalizeColumnSpecificationStrategies,

	getAttributeStrategies,

	setAttributeStrategies,


	createCreateRowStrategy,
	createCreateColumnSpecificationNodeStrategy
) {
	'use strict';

	function createTableBorderAttributeStrategy (parentNodeSelector) {
		return function tableBorderAttributeStrategy (context, data, blueprint) {
			var tableFigureNode = evaluateXPathToFirstNode(parentNodeSelector, context.node, blueprint);
			if (tableFigureNode) {
				blueprint.setAttribute(tableFigureNode, 'frame', context.specification.borders);
			}
		};
	}

	/**
	 * Configures the table definition for CALS tables.
	 *
	 * @param {CalsTableOptions} options
	 */
	function CalsTableDefinition (options) {
		// Configurable element names
		var tableFigureLocalName = options.table.localName;
		var headLocalName = options.thead && options.thead.localName ? options.thead.localName : 'thead';
		var footLocalName = options.tfoot && options.tfoot.localName ? options.tfoot.localName : 'tfoot';

		// Configurable namespace URIs
		var tableNamespaceURI = options.table && options.table.namespaceURI ? options.table.namespaceURI : '';
		var namespaceURI = options.tgroup && options.tgroup.namespaceURI ? options.tgroup.namespaceURI : '';

		// Configurable true/false values
		var trueValue = (options.yesOrNo && options.yesOrNo.yesValue) ? options.yesOrNo.yesValue : '1';
		var falseValue = (options.yesOrNo && options.yesOrNo.noValue) ? options.yesOrNo.noValue : '0';

		var namespaceSelector = 'Q{' + namespaceURI + '}';
		var selectorParts = {
			tableFigure: 'Q{' + tableNamespaceURI + '}' + tableFigureLocalName,
			table: namespaceSelector + 'tgroup' + (options.table && options.table.tableFilterSelector ?
					'[' + options.table.tableFilterSelector + ']' :
					''),
			headerContainer: namespaceSelector + headLocalName,
			bodyContainer: namespaceSelector + 'tbody',
			footerContainer: namespaceSelector + footLocalName,
			row: namespaceSelector + 'row',
			cell: namespaceSelector + 'entry',
			columnSpecification: namespaceSelector + 'colspec'
		};

		// Alias selector parts
		var tableFigure = selectorParts.tableFigure;
		var tgroup = selectorParts.table;
		var thead = selectorParts.headerContainer;
		var tbody = selectorParts.bodyContainer;
		var tfoot = selectorParts.footerContainer;
		var row = selectorParts.row;
		var entry = selectorParts.cell;
		var colspec = selectorParts.columnSpecification;

		// Properties object
		var properties = {
			selectorParts: selectorParts,
			namespaceURI: namespaceURI,
			cellLocalName: 'entry',

			// Table borders
			defaultBorderValue: 'all',
			tableBorderToCvkTableBorder: {
				'none': 'none',
				'all': 'all'
			},

			// Boolean values
			trueValue: trueValue,
			falseValue: falseValue,

			// Defining node selectors
			tableDefiningNodeSelector: 'self::' + tableFigure,
			cellDefiningNodeSelector: 'self::' + entry,
			tablePartsNodeSelector: Object.keys(selectorParts).map(function (key) {
					return 'self::' + selectorParts[key];
				}.bind(this)).join(' or '),

			// Finds
			findHeaderRowNodesXPathQuery: './' + thead + '/' + row,
			findBodyRowNodesXPathQuery: './' + tbody + '/' + row,
			findFooterRowNodesXPathQuery: './' + tfoot + '/' + row,

			findHeaderContainerNodesXPathQuery: './' + thead,
			findBodyContainerNodesXPathQuery: './' + tbody,
			findFooterContainerNodesXPathQuery: './' + tfoot,

			findColumnSpecificationNodesXPathQuery: './' + colspec,

			findCellNodesXPathQuery: './' + entry,

			// Data
			getNumberOfColumnsXPathQuery: './@cols => number()',
			getRowSpanForCellNodeXPathQuery: 'let $rowspan := ./@morerows => number() return if ($rowspan) then $rowspan + 1 else 1',
			getColumnSpanForCellNodeXPathQuery:
				'let $colname := ./@colname, ' +
				'$namest      := ./@namest, ' +
				'$nameend     := ./@nameend, ' +
				'$startindex  := ./ancestor::' + tgroup + '/' + colspec + '[@colname = $namest]/preceding-sibling::' + colspec + ' => count() + 1, ' +
				'$endindex    := ./ancestor::' + tgroup + '/' + colspec + '[@colname = $nameend]/preceding-sibling::' + colspec + ' => count() + 1 ' +
				'return if ($colname and not($namest or $nameend)) then 1 else ($endindex - $startindex) + 1',

			// Normalizations
			normalizeContainerNodeStrategies: [
					normalizeContainerNodeStrategies.createAddHeaderContainerNodeStrategy(namespaceURI, 'thead'),
					normalizeContainerNodeStrategies.createAddBodyContainerNodeStrategy(namespaceURI, 'tbody')
				],

			normalizeColumnSpecificationStrategies: [
					normalizeColumnSpecificationStrategies.createRecreateColumnName('column')
				],
			findNextColumnSpecification: function (columnIndex, columnSpecification, columnSpecificationIndex, columnSpecifications) {
					var startIndexAtZero = columnSpecifications[0] && columnSpecifications[0] === 0;
					return (columnSpecification.columnNumber === (startIndexAtZero ? columnIndex : columnIndex + 1)) ||
							(columnSpecification.columnNumber !== undefined && columnSpecificationIndex >= columnIndex);
				},

			// Defaults
			getDefaultColumnSpecificationStrategy: function (context) {
					return {
						columnName: 'column-' + context.columnIndex,
						oldColumnName: 'column-' + context.columnIndex,
						columnNumber: context.columnIndex + 1,
						columnWidth: new Width('1*'),
						rowSeparator: false,
						columnSeparator: false
					};
				},
			getDefaultCellSpecificationStrategy: function (context) {
					return {
						rows: 1,
						cols: 1,
						width: new Width('1*'),
						columnName: 'column-' + context.columnIndex,
						rowSeparator: false,
						columnSeparator: false
					};
				},

			// Create elements
			createColumnSpecificationNodeStrategy: createCreateColumnSpecificationNodeStrategy(namespaceURI, 'colspec', './*[self::' + thead + ' or self::' + tbody + ']'),
			createRowStrategy: createCreateRowStrategy(namespaceURI, 'row'),

			// Specifications
			getTableSpecificationStrategies: [
					getAttributeStrategies.createGetAttributeValueAsStringStrategy('borders', './parent::' + tableFigure + '/@frame')
				],

			getColumnSpecificationStrategies: [
					getAttributeStrategies.createGetAttributeValueAsBooleanStrategy('columnSeparator', 'let $sep := ./@colsep return if ($sep) then $sep = "' + trueValue + '" else true()'),
					getAttributeStrategies.createGetAttributeValueAsBooleanStrategy('rowSeparator', 'let $sep := ./@rowsep return if ($sep) then $sep = "' + trueValue + '" else true()'),
					getAttributeStrategies.createGetAttributeValueAsStringStrategy('horizontalAlignment', './@align'),
					getAttributeStrategies.createGetAttributeValueAsWidthStrategy('columnWidth', 'let $colwidth := ./@colwidth return if ($colwidth) then $colwidth else "1*"'),
					getAttributeStrategies.createGetAttributeValueAsStringStrategy('oldColumnName', './@colname'),
					getAttributeStrategies.createGetAttributeValueAsNumberStrategy('columnNumber', './@colnum'),
					getAttributeStrategies.createGetAttributeValueAsStringStrategy('columnName', 'let $name := ./@colname return if ($name) then $name else ("column-", $columnIndex => string()) => string-join()')
				],

			getRowSpecificationStrategies: [
					getAttributeStrategies.createGetAttributeValueAsStringStrategy('verticalAlignment', 'let $valign := ./@valign return if ($valign) then $valign else "bottom"')
				],

			getCellSpecificationStrategies: [
					getAttributeStrategies.createGetAttributeValueAsStringStrategy('horizontalAlignment', './@align'),
					getAttributeStrategies.createGetAttributeValueAsStringStrategy('verticalAlignment', './@valign'),
					getAttributeStrategies.createGetAttributeValueAsBooleanStrategy('rowSeparator',
						'if (./@rowsep) then ./@rowsep = "' + trueValue + '" ' +
						'else let $columnRowsep := ./ancestor::' + tgroup + '[1]/' + colspec + '[@colname = ./@colname or @colname = ./@namest]/@rowsep return if ($columnRowsep) then $columnRowsep = "' + trueValue + '" ' +
						'else false()'),
					getAttributeStrategies.createGetAttributeValueAsBooleanStrategy('columnSeparator',
						'if (./@colsep) then ./@colsep = "' + trueValue + '" ' +
						'else let $columnColsep := ./ancestor::' + tgroup + '[1]/' + colspec + '[@colname = ./@colname or @colname = ./@namest]/@colsep return if ($columnColsep) then $columnColsep = "' + trueValue + '" ' +
						'else false()'),
					getAttributeStrategies.createGetAttributeValueAsStringStrategy('columnName', './@colname'),
					getAttributeStrategies.createGetAttributeValueAsStringStrategy('nameEnd', './@nameend'),
					getAttributeStrategies.createGetAttributeValueAsStringStrategy('nameStart', './@namest'),
				],

			// Set attributes
			setTableNodeAttributeStrategies: [
					setAttributeStrategies.createColumnCountAsAttributeStrategy('cols'),
					createTableBorderAttributeStrategy('./parent::' + tableFigure)
				],

			setColumnSpecificationNodeAttributeStrategies: [
					setAttributeStrategies.createStringValueAsAttributeStrategy('colname', 'columnName'),
					setAttributeStrategies.createColumnNumberAsAttributeStrategy('colnum', 1),
					setAttributeStrategies.createBooleanValueAsAttributeStrategy('colsep', 'columnSeparator', trueValue, trueValue, falseValue),
					setAttributeStrategies.createBooleanValueAsAttributeStrategy('rowsep', 'rowSeparator', trueValue, trueValue, falseValue),
					setAttributeStrategies.createStringValueAsAttributeStrategy('align', 'horizontalAlignment'),
					setAttributeStrategies.createColumnWidthAsAttributeStrategy('colwidth', 'columnWidth', '1*')
				],

			setCellNodeAttributeStrategies: [
					setAttributeStrategies.createBooleanValueAsAttributeStrategy('rowsep', 'rowSeparator', trueValue, trueValue, falseValue),
					setAttributeStrategies.createBooleanValueAsAttributeStrategy('colsep', 'columnSeparator', trueValue, trueValue, falseValue),
					setAttributeStrategies.createColumnNameAsAttributeStrategy('colname', 'namest', 'nameend'),
					setAttributeStrategies.createRowSpanAsAttributeStrategy('morerows', true),
					setAttributeStrategies.createStringValueAsAttributeStrategy('align', 'horizontalAlignment'),
					setAttributeStrategies.createStringValueAsAttributeStrategy('valign', 'verticalAlignment')
				],
		};

		TableDefinition.call(this, properties);
	}

	CalsTableDefinition.prototype = Object.create(TableDefinition.prototype);
	CalsTableDefinition.prototype.constructor = CalsTableDefinition;

	CalsTableDefinition.prototype.buildTableGridModel = function (node, blueprint) {
		var tableElement = evaluateXPathToFirstNode('descendant-or-self::' + this.selectorParts.table, node, blueprint);
		return TableDefinition.prototype.buildTableGridModel.call(this, tableElement, blueprint);
	};

	CalsTableDefinition.prototype.applyToDom = function (tableGridModel, tableNode, blueprint, format) {
		var actualTableNode = evaluateXPathToFirstNode('descendant-or-self::' + this.selectorParts.table, tableNode, blueprint);
		if (!actualTableNode) {
			actualTableNode = blueprint.appendChild(
				tableNode,
				namespaceManager.createElementNS(tableNode.ownerDocument, this.namespaceURI, 'tgroup'));
		}
		return TableDefinition.prototype.applyToDom.call(this, tableGridModel, actualTableNode, blueprint, format);
	};

	return CalsTableDefinition;
});
