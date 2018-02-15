define([
	'fontoxml-dom-namespaces/namespaceManager',
	'fontoxml-selectors/evaluateXPathToFirstNode',

	'fontoxml-table-flow/TableDefinition',
	'fontoxml-table-flow/createCreateColumnSpecificationNodeStrategy',
	'fontoxml-table-flow/createCreateRowStrategy',
	'fontoxml-table-flow/getAttributeStrategies',
	'fontoxml-table-flow/normalizeContainerNodeStrategies',
	'fontoxml-table-flow/normalizeColumnSpecificationStrategies',
	'fontoxml-table-flow/setAttributeStrategies'
], function (
	namespaceManager,
	evaluateXPathToFirstNode,

	TableDefinition,
	createCreateColumnSpecificationNodeStrategy,
	createCreateRowStrategy,
	getAttributeStrategies,
	normalizeContainerNodeStrategies,
	normalizeColumnSpecificationStrategies,
	setAttributeStrategies
) {
	'use strict';

	function parseWidth (width) {
		return /(?:(\d*(?:\.\d*)?)\*)?\+?(?:(\d+(?:\.\d*)?)px)?/i.exec(width);
	}

	function createTableBorderAttributeStrategy (parentNodeSelector) {
		return function tableBorderAttributeStrategy (context, _data, blueprint) {
			var tableFigureNode = evaluateXPathToFirstNode(parentNodeSelector, context.node, blueprint);
			if (tableFigureNode) {
				blueprint.setAttribute(tableFigureNode, 'frame', context.specification.borders || 'all');
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
			tableFigure: 'Q{' + tableNamespaceURI + '}' + tableFigureLocalName + (options.tgroup && options.tgroup.tableFigureFilterSelector ?
					'[' + options.tgroup.tableFigureFilterSelector + ']' :
					''),
			table: namespaceSelector + 'tgroup',
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
				none: 'none',
				all: 'all'
			},

			// Widths
			widthToHtmlWidthStrategy: function (width, widths) {
					var proportion = parseFloat(parseWidth(width)[1]) || 0;
					var totalProportion = widths.reduce(function (total, proportion) {
						return total + (parseFloat(parseWidth(proportion)[1]) || 0);
					}, 0);

					return 100 * proportion / totalProportion + '%';
				},
			addWidthsStrategy: function (width1, width2) {
					var parsedWidth1 = parseWidth(width1);
					var proportion1 = parseFloat(parsedWidth1[1]) || 0;
					var fixed1 = parseFloat(parsedWidth1[2]) || 0;

					var parsedWidth2 = parseWidth(width2);
					var proportion2 = parseFloat(parsedWidth2[1]) || 0;
					var fixed2 = parseFloat(parsedWidth2[2]) || 0;

					var proportion = proportion1 + proportion2;
					var fixed = fixed1 + fixed2;

					return proportion !== 0 ? proportion + '*' : '' +
						fixed !== 0 ? fixed + 'px' : '';
				},
			divideByTwoStrategy: function (width) {
					var parsedWidth = parseWidth(width);

					var proportion = parseFloat(parsedWidth[1]);
					var fixed = parseFloat(parsedWidth[2]);

					return proportion ? (proportion / 2) + '*' : '' +
						fixed ? (fixed / 2) + 'px' : '';
				},

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
						columnWidth: '1*',
						rowSeparator: false,
						columnSeparator: false
					};
				},
			getDefaultCellSpecificationStrategy: function (context) {
					return {
						rows: 1,
						cols: 1,
						width: '1*',
						columnName: 'column-' + context.columnIndex,
						rowSeparator: true,
						columnSeparator: true
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
					getAttributeStrategies.createGetAttributeValueAsStringStrategy('columnWidth', 'let $colwidth := ./@colwidth return if ($colwidth) then $colwidth else "1*"'),
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
						'else true()'),
					getAttributeStrategies.createGetAttributeValueAsBooleanStrategy('columnSeparator',
						'if (./@colsep) then ./@colsep = "' + trueValue + '" ' +
						'else let $columnColsep := ./ancestor::' + tgroup + '[1]/' + colspec + '[@colname = ./@colname or @colname = ./@namest]/@colsep return if ($columnColsep) then $columnColsep = "' + trueValue + '" ' +
						'else true()'),
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
					setAttributeStrategies.createStringValueAsAttributeStrategy('colwidth', 'columnWidth')
				],

			setCellNodeAttributeStrategies: [
					setAttributeStrategies.createBooleanValueAsAttributeStrategy('rowsep', 'rowSeparator', trueValue, trueValue, falseValue),
					setAttributeStrategies.createBooleanValueAsAttributeStrategy('colsep', 'columnSeparator', trueValue, trueValue, falseValue),
					setAttributeStrategies.createColumnNameAsAttributeStrategy('colname', 'namest', 'nameend'),
					setAttributeStrategies.createRowSpanAsAttributeStrategy('morerows', true),
					setAttributeStrategies.createStringValueAsAttributeStrategy('align', 'horizontalAlignment'),
					setAttributeStrategies.createStringValueAsAttributeStrategy('valign', 'verticalAlignment')
				]
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
