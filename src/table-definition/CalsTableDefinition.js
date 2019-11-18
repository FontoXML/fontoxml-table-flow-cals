import namespaceManager from 'fontoxml-dom-namespaces/src/namespaceManager.js';
import evaluateXPathToFirstNode from 'fontoxml-selectors/src/evaluateXPathToFirstNode.js';
import TableDefinition from 'fontoxml-table-flow/src/TableDefinition.js';
import createCreateCellNodeStrategy from 'fontoxml-table-flow/src/createCreateCellNodeStrategy.js';
import createCreateColumnSpecificationNodeStrategy from 'fontoxml-table-flow/src/createCreateColumnSpecificationNodeStrategy.js';
import createCreateRowStrategy from 'fontoxml-table-flow/src/createCreateRowStrategy.js';
import getSpecificationValueStrategies from 'fontoxml-table-flow/src/getSpecificationValueStrategies.js';
import normalizeContainerNodeStrategies from 'fontoxml-table-flow/src/normalizeContainerNodeStrategies.js';
import normalizeColumnSpecificationStrategies from 'fontoxml-table-flow/src/normalizeColumnSpecificationStrategies.js';
import setAttributeStrategies from 'fontoxml-table-flow/src/setAttributeStrategies.js';

function parseWidth(width) {
	if (width === '*') {
		// '*' is actually '1*'
		return [width, '1', undefined];
	}
	return /(?:(\d*(?:\.\d*)?)\*)?\+?(?:(\d+(?:\.\d*)?)px)?/i.exec(width);
}

function createTableBorderAttributeStrategy(parentNodeSelector) {
	return function tableBorderAttributeStrategy(context, _data, blueprint) {
		var tableFigureNode = evaluateXPathToFirstNode(parentNodeSelector, context.node, blueprint);
		if (tableFigureNode) {
			blueprint.setAttribute(
				tableFigureNode,
				'frame',
				context.specification.borders ? 'all' : 'none'
			);
		}
	};
}

/**
 * Configures the table definition for CALS tables.
 *
 * @param {CalsTableOptions} options
 */
function CalsTableDefinition(options) {
	// Configurable element names
	var tableFigureLocalName = options.table.localName;
	var headLocalName =
		options.thead && options.thead.localName ? options.thead.localName : 'thead';
	var footLocalName =
		options.tfoot && options.tfoot.localName ? options.tfoot.localName : 'tfoot';

	// Configurable namespace URIs
	var tableNamespaceURI =
		options.table && options.table.namespaceURI ? options.table.namespaceURI : '';
	var namespaceURI =
		options.tgroup && options.tgroup.namespaceURI ? options.tgroup.namespaceURI : '';

	// Configurable true/false values
	this.trueValue = options.yesOrNo && options.yesOrNo.yesValue ? options.yesOrNo.yesValue : '1';
	this.falseValue = options.yesOrNo && options.yesOrNo.noValue ? options.yesOrNo.noValue : '0';

	var namespaceSelector = 'Q{' + namespaceURI + '}';
	var selectorParts = {
		tableFigure:
			'Q{' +
			tableNamespaceURI +
			'}' +
			tableFigureLocalName +
			(options.tgroup && options.tgroup.tableFigureFilterSelector
				? '[' + options.tgroup.tableFigureFilterSelector + ']'
				: ''),
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
	var thead = selectorParts.headerContainer;
	var tbody = selectorParts.bodyContainer;
	var tfoot = selectorParts.footerContainer;
	var row = selectorParts.row;
	var entry = selectorParts.cell;
	var colspec = selectorParts.columnSpecification;

	// Properties object
	var properties = {
		selectorParts: selectorParts,

		supportsBorders: true,
		supportsCellAlignment: true,

		// Widths
		widthToHtmlWidthStrategy: function(width, widths) {
			var proportion = parseFloat(parseWidth(width)[1]) || 1;
			var totalProportion = widths.reduce(function(total, proportion) {
				return total + (parseFloat(parseWidth(proportion)[1]) || 1);
			}, 0);

			return (100 * proportion) / totalProportion + '%';
		},
		addWidthsStrategy: function(width1, width2) {
			var parsedWidth1 = parseWidth(width1);
			var proportion1 = parseFloat(parsedWidth1[1]) || 0;
			var fixed1 = parseFloat(parsedWidth1[2]) || 0;

			var parsedWidth2 = parseWidth(width2);
			var proportion2 = parseFloat(parsedWidth2[1]) || 0;
			var fixed2 = parseFloat(parsedWidth2[2]) || 0;

			var proportion = proportion1 + proportion2;
			var fixed = fixed1 + fixed2;

			return proportion !== 0 ? proportion + '*' : '' + fixed !== 0 ? fixed + 'px' : '';
		},
		divideByTwoStrategy: function(width) {
			var parsedWidth = parseWidth(width);

			var proportion = parseFloat(parsedWidth[1]);
			var fixed = parseFloat(parsedWidth[2]);

			return proportion ? proportion / 2 + '*' : '' + fixed ? fixed / 2 + 'px' : '';
		},

		widthsToFractionsStrategy: function(widths) {
			var parsedWidths = widths.map(function(width) {
				if (width === '*') {
					return 1;
				}

				// Parsing withs for the column width popover does not use the parseWidth
				// function bacause widths containing fixed widths are considered invalid
				// values for the popover.
				var match = /^([0-9]+(?:\.[0-9]+)?)\*$/.exec(width);

				if (!match) {
					return null;
				}

				var value = parseFloat(match[1]);
				return Number.isNaN(value) ? null : value;
			});

			if (parsedWidths.indexOf(null) !== -1) {
				return parsedWidths.map(function() {
					return 1 / parsedWidths.length;
				});
			}

			var totalWidth = parsedWidths.reduce(function(total, width) {
				return total + width;
			}, 0);

			return parsedWidths.map(function(width) {
				return width / totalWidth;
			});
		},
		fractionsToWidthsStrategy: function(fractions) {
			return fractions.map(function(fraction) {
				return Math.round(fraction * 100) + '*';
			});
		},

		// Environment
		environmentQuery:
			'map { ' +
			'"indexByColname": map:merge(child::' +
			colspec +
			'/map { string(@colname): count(preceding-sibling::' +
			colspec +
			') }), ' +
			'"colsepByColname": map:merge(child::' +
			colspec +
			'[@colsep]/map { string(@colname): number(@colsep) }), ' +
			'"rowsepByColname": map:merge(child::' +
			colspec +
			'[@rowsep]/map { string(@colname): number(@rowsep) }) ' +
			'}',

		// Defining node selectors
		tableDefiningNodeSelector: 'self::' + tableFigure,

		// Header row node selector
		headerRowNodeSelector: `self::${row}[parent::${thead}]`,

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
		getRowSpanForCellNodeXPathQuery:
			'let $rowspan := ./@morerows => number() return if ($rowspan) then $rowspan + 1 else 1',
		getColumnSpanForCellNodeXPathQuery:
			'let $colname := ./@colname, $namest := ./@namest, $nameend := ./@nameend ' +
			'return if ($colname and not($namest or $nameend)) ' +
			'then 1 ' +
			'else (($indexByColname(string($nameend)), 0)[1] - ($indexByColname(string($namest)), 0)[1] + 1)',

		// Normalizations
		normalizeContainerNodeStrategies: [
			normalizeContainerNodeStrategies.createAddHeaderContainerNodeStrategy(
				namespaceURI,
				'thead'
			),
			normalizeContainerNodeStrategies.createAddBodyContainerNodeStrategy(
				namespaceURI,
				'tbody'
			)
		],

		normalizeColumnSpecificationStrategies: [
			normalizeColumnSpecificationStrategies.createRecreateColumnName('column')
		],
		findNextColumnSpecification: function(
			columnIndex,
			columnSpecification,
			columnSpecificationIndex,
			columnSpecifications
		) {
			var startIndexAtZero =
				columnSpecifications[0] && columnSpecifications[0].columnNumber === 0;
			return (
				columnSpecification.columnNumber ===
					(startIndexAtZero ? columnIndex : columnIndex + 1) ||
				(columnSpecification.columnNumber !== undefined &&
					columnSpecificationIndex >= columnIndex)
			);
		},

		// Defaults
		getDefaultColumnSpecificationStrategy: function(context) {
			return {
				columnName: 'column-' + context.columnIndex,
				columnNumber: context.columnIndex + 1,
				columnWidth: '1*',
				rowSeparator: true,
				columnSeparator: true
			};
		},
		getDefaultCellSpecificationStrategy: function(context) {
			return {
				width: '1*',
				columnName: 'column-' + context.columnIndex,
				rowSeparator: true,
				columnSeparator: true
			};
		},

		// Create elements
		createCellNodeStrategy: createCreateCellNodeStrategy(namespaceURI, 'entry'),
		createColumnSpecificationNodeStrategy: createCreateColumnSpecificationNodeStrategy(
			namespaceURI,
			'colspec',
			'./*[self::' + thead + ' or self::' + tbody + ']'
		),
		createRowStrategy: createCreateRowStrategy(namespaceURI, 'row'),

		// Specifications
		getTableSpecificationStrategies: [
			getSpecificationValueStrategies.createGetValueAsBooleanStrategy(
				'borders',
				'./parent::' + tableFigure + '/@frame = "all"'
			)
		],

		getColumnSpecificationStrategies: [
			getSpecificationValueStrategies.createGetValueAsBooleanStrategy(
				'columnSeparator',
				'let $sep := ./@colsep return if ($sep) then $sep = "' +
					this.trueValue +
					'" else true()'
			),
			getSpecificationValueStrategies.createGetValueAsBooleanStrategy(
				'rowSeparator',
				'let $sep := ./@rowsep return if ($sep) then $sep = "' +
					this.trueValue +
					'" else true()'
			),
			getSpecificationValueStrategies.createGetValueAsStringStrategy(
				'horizontalAlignment',
				'./@align'
			),
			getSpecificationValueStrategies.createGetValueAsStringStrategy(
				'columnWidth',
				'let $colwidth := ./@colwidth return if ($colwidth) then $colwidth else "1*"'
			),
			getSpecificationValueStrategies.createGetValueAsNumberStrategy(
				'columnNumber',
				'./@colnum'
			),
			getSpecificationValueStrategies.createGetValueAsStringStrategy(
				'columnName',
				'let $name := ./@colname return if ($name) then $name else ("column-", $columnIndex => string()) => string-join()'
			)
		],

		getRowSpecificationStrategies: [
			getSpecificationValueStrategies.createGetValueAsStringStrategy(
				'verticalAlignment',
				'let $valign := ./@valign return if ($valign) then $valign else "bottom"'
			)
		],

		getCellSpecificationStrategies: [
			getSpecificationValueStrategies.createGetValueAsStringStrategy(
				'horizontalAlignment',
				'./@align'
			),
			getSpecificationValueStrategies.createGetValueAsStringStrategy(
				'verticalAlignment',
				'./@valign'
			),
			getSpecificationValueStrategies.createGetValueAsBooleanStrategy(
				'rowSeparator',
				'if (./@rowsep) then ' +
					'./@rowsep = "' +
					this.trueValue +
					'" ' +
					'else ' +
					'if (./@colname or ./@namest) then ' +
					'let $columnName := if (./@colname) then ./@colname else ./@namest, ' +
					'$columnRowsep := $rowsepByColname($columnName) ' +
					'return $columnRowsep = "' +
					this.trueValue +
					'" ' +
					'else true()'
			),
			getSpecificationValueStrategies.createGetValueAsBooleanStrategy(
				'columnSeparator',
				'if (./@colsep) then ' +
					'./@colsep = "' +
					this.trueValue +
					'" ' +
					'else ' +
					'if (./@colname or ./@namest) then ' +
					'let $columnName := if (./@colname) then ./@colname else ./@namest, ' +
					'$columnColsep := $colsepByColname($columnName) ' +
					'return $columnColsep = "' +
					this.trueValue +
					'" ' +
					'else true()'
			),
			getSpecificationValueStrategies.createGetValueAsStringStrategy(
				'columnName',
				'./@colname'
			),
			getSpecificationValueStrategies.createGetValueAsStringStrategy('nameEnd', './@nameend'),
			getSpecificationValueStrategies.createGetValueAsStringStrategy('nameStart', './@namest')
		],

		// Set attributes
		setTableNodeAttributeStrategies: [
			setAttributeStrategies.createColumnCountAsAttributeStrategy('cols'),
			createTableBorderAttributeStrategy('./parent::' + tableFigure)
		],

		setColumnSpecificationNodeAttributeStrategies: [
			setAttributeStrategies.createStringValueAsAttributeStrategy('colname', 'columnName'),
			setAttributeStrategies.createColumnNumberAsAttributeStrategy('colnum', 1),
			setAttributeStrategies.createBooleanValueAsAttributeStrategy(
				'colsep',
				'columnSeparator',
				this.trueValue,
				this.trueValue,
				this.falseValue
			),
			setAttributeStrategies.createBooleanValueAsAttributeStrategy(
				'rowsep',
				'rowSeparator',
				this.trueValue,
				this.trueValue,
				this.falseValue
			),
			setAttributeStrategies.createStringValueAsAttributeStrategy(
				'align',
				'horizontalAlignment'
			),
			setAttributeStrategies.createStringValueAsAttributeStrategy('colwidth', 'columnWidth')
		],

		setCellNodeAttributeStrategies: [
			setAttributeStrategies.createBooleanValueAsAttributeStrategy(
				'rowsep',
				'rowSeparator',
				this.trueValue,
				this.trueValue,
				this.falseValue
			),
			setAttributeStrategies.createBooleanValueAsAttributeStrategy(
				'colsep',
				'columnSeparator',
				this.trueValue,
				this.trueValue,
				this.falseValue
			),
			setAttributeStrategies.createColumnNameAsAttributeStrategy(
				'colname',
				'namest',
				'nameend'
			),
			setAttributeStrategies.createRowSpanAsAttributeStrategy('morerows', true),
			setAttributeStrategies.createStringValueAsAttributeStrategy(
				'align',
				'horizontalAlignment'
			),
			setAttributeStrategies.createStringValueAsAttributeStrategy(
				'valign',
				'verticalAlignment'
			)
		],

		horizontalAlignmentOperationNames: [
			'contextual-cals-set-cell-horizontal-alignment-left',
			'contextual-cals-set-cell-horizontal-alignment-center',
			'contextual-cals-set-cell-horizontal-alignment-right',
			'contextual-cals-set-cell-horizontal-alignment-justify'
		],
		verticalAlignmentOperationNames: [
			'contextual-cals-set-cell-vertical-alignment-top',
			'contextual-cals-set-cell-vertical-alignment-center',
			'contextual-cals-set-cell-vertical-alignment-bottom'
		],
		columnBorderOperationNames: ['contextual-cals-toggle-cell-border-all'],
		rowBorderOperationNames: ['contextual-cals-toggle-cell-border-all']
	};

	TableDefinition.call(this, properties);
}

CalsTableDefinition.prototype = Object.create(TableDefinition.prototype);
CalsTableDefinition.prototype.constructor = CalsTableDefinition;

CalsTableDefinition.prototype.buildTableGridModel = function(node, blueprint) {
	var tableElement = evaluateXPathToFirstNode(
		'descendant-or-self::' + this.selectorParts.table,
		node,
		blueprint
	);
	return TableDefinition.prototype.buildTableGridModel.call(this, tableElement, blueprint);
};

CalsTableDefinition.prototype.buildTableGridModelKey = function(node, blueprint) {
	var tableElement = evaluateXPathToFirstNode(
		'descendant-or-self::' + this.selectorParts.table,
		node,
		blueprint
	);
	return TableDefinition.prototype.buildTableGridModelKey.call(this, tableElement, blueprint);
};

CalsTableDefinition.prototype.applyToDom = function(tableGridModel, tableNode, blueprint, format) {
	var actualTableNode = evaluateXPathToFirstNode(
		'descendant-or-self::' + this.selectorParts.table,
		tableNode,
		blueprint
	);
	if (!actualTableNode) {
		actualTableNode = blueprint.appendChild(
			tableNode,
			namespaceManager.createElementNS(tableNode.ownerDocument, this.namespaceURI, 'tgroup')
		);
	}
	return TableDefinition.prototype.applyToDom.call(
		this,
		tableGridModel,
		actualTableNode,
		blueprint,
		format
	);
};

export default CalsTableDefinition;
