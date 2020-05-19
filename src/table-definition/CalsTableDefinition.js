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
		const tableFigureNode = evaluateXPathToFirstNode(
			parentNodeSelector,
			context.node,
			blueprint
		);
		if (tableFigureNode) {
			blueprint.setAttribute(
				tableFigureNode,
				'frame',
				context.specification.borders ? 'all' : 'none'
			);
		}
	};
}

function gcd(x, y) {
	while (y) {
		const t = y;
		y = x % y;
		x = t;
	}
	return x;
}

function findGreatestCommonDivisor(input) {
	let a = input[0];
	let b;
	for (let i = 1; i < input.length; i++) {
		b = input[i];
		a = gcd(a, b);
	}
	return a;
}

/**
 * Configures the table definition for CALS tables.
 *
 * @param {CalsTableOptions} options
 */
function CalsTableDefinition(options) {
	// Configurable element names
	const tableFigureLocalName = options.table.localName;
	const headLocalName =
		options.thead && options.thead.localName ? options.thead.localName : 'thead';
	const footLocalName =
		options.tfoot && options.tfoot.localName ? options.tfoot.localName : 'tfoot';

	// Configurable namespace URIs
	const tableFigureNamespaceURI =
		options.table && options.table.namespaceURI ? options.table.namespaceURI : '';
	const namespaceURI =
		options.tgroup && options.tgroup.namespaceURI ? options.tgroup.namespaceURI : '';

	// Configurable true/false values
	this.trueValue = options.yesOrNo && options.yesOrNo.yesValue ? options.yesOrNo.yesValue : '1';
	this.falseValue = options.yesOrNo && options.yesOrNo.noValue ? options.yesOrNo.noValue : '0';

	const tableFigureFilter =
		options.tgroup && options.tgroup.tableFigureFilterSelector
			? `[${options.tgroup.tableFigureFilterSelector}]`
			: '';
	const tableFigureSelectorPart = `Q{${tableFigureNamespaceURI}}${tableFigureLocalName}${tableFigureFilter}`;
	const tableFigureParentFilter = tableFigureFilter ? `[parent::${tableFigureSelectorPart}]` : '';
	const namespaceSelector = 'Q{' + namespaceURI + '}';
	const selectorParts = {
		tableFigure: tableFigureSelectorPart,
		table: `${namespaceSelector}tgroup${tableFigureParentFilter}`,
		headerContainer: namespaceSelector + headLocalName,
		bodyContainer: namespaceSelector + 'tbody',
		footerContainer: namespaceSelector + footLocalName,
		row: namespaceSelector + 'row',
		cell: namespaceSelector + 'entry',
		columnSpecification: namespaceSelector + 'colspec'
	};

	// Alias selector parts
	const tableFigure = selectorParts.tableFigure;
	const thead = selectorParts.headerContainer;
	const tbody = selectorParts.bodyContainer;
	const tfoot = selectorParts.footerContainer;
	const row = selectorParts.row;
	const entry = selectorParts.cell;
	const colspec = selectorParts.columnSpecification;

	// Properties object
	const properties = {
		selectorParts: selectorParts,

		supportsBorders: true,
		supportsCellAlignment: true,

		// Widths
		widthToHtmlWidthStrategy: function(width, widths) {
			const proportion = parseFloat(parseWidth(width)[1]) || 1;
			const totalProportion = widths.reduce(function(total, proportion) {
				return total + (parseFloat(parseWidth(proportion)[1]) || 1);
			}, 0);

			return (100 * proportion) / totalProportion + '%';
		},
		addWidthsStrategy: function(width1, width2) {
			const parsedWidth1 = parseWidth(width1);
			const proportion1 = parseFloat(parsedWidth1[1]) || 0;
			const fixed1 = parseFloat(parsedWidth1[2]) || 0;

			const parsedWidth2 = parseWidth(width2);
			const proportion2 = parseFloat(parsedWidth2[1]) || 0;
			const fixed2 = parseFloat(parsedWidth2[2]) || 0;

			const proportion = proportion1 + proportion2;
			const fixed = fixed1 + fixed2;

			return proportion !== 0 ? proportion + '*' : '' + fixed !== 0 ? fixed + 'px' : '';
		},
		divideByTwoStrategy: function(width) {
			const parsedWidth = parseWidth(width);

			const proportion = parseFloat(parsedWidth[1]);
			const fixed = parseFloat(parsedWidth[2]);

			return proportion ? proportion / 2 + '*' : '' + fixed ? fixed / 2 + 'px' : '';
		},

		widthsToFractionsStrategy: function(widths) {
			const parsedWidths = widths.map(function(width) {
				if (width === '*') {
					return 1;
				}

				// Parsing withs for the column width popover does not use the parseWidth
				// function bacause widths containing fixed widths are considered invalid
				// values for the popover.
				const match = /^([0-9]+(?:\.[0-9]+)?)\*$/.exec(width);

				if (!match) {
					return null;
				}

				const value = parseFloat(match[1]);
				return Number.isNaN(value) ? null : value;
			});

			if (parsedWidths.indexOf(null) !== -1) {
				return parsedWidths.map(function() {
					return 1 / parsedWidths.length;
				});
			}

			const totalWidth = parsedWidths.reduce(function(total, width) {
				return total + width;
			}, 0);

			return parsedWidths.map(function(width) {
				return width / totalWidth;
			});
		},
		fractionsToWidthsStrategy: function(fractions) {
			fractions = fractions.map(function(fraction) {
				return Math.round(fraction * 100);
			});

			const gcd = findGreatestCommonDivisor(fractions);
			return fractions.map(fraction => {
				return fraction / gcd + '*';
			});
		},

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

		getColumnIdentifiersXPathQuery:
			'map {"columnName": string(./@colname), "namest": string(./@namest), "nameend": string(./@nameend)}',

		getColumnDataForCellXPathQuery: `
			if($columnIdentifiers("namest") and $columnIdentifiers("nameend")) then
				let $colSpecifications := [
					fonto:column-spec(., $columnIdentifiers("namest")),
					fonto:column-spec(., $columnIdentifiers("nameend"))
				]
				return
					if($colSpecifications(1) instance of map(*) and $colSpecifications(2) instance of map(*)) then
						map {
							"colsep": $colSpecifications(1)("columnSeparator"),
							"rowsep": $colSpecifications(1)("rowSeparator"),
							"colspan": number($colSpecifications(2)("index")) -
								number($colSpecifications(1)("index")) + 1
						}
					else
						map {"colsep": false(), "rowsep": false(), "colspan": 1}
			else if ($columnIdentifiers("columnName")) then
				let $colSpecification := fonto:column-spec(., $columnIdentifiers("columnName"))
				return
					if($colSpecification instance of map(*)) then
						map {
							"colsep": $colSpecification("columnSeparator"),
							"rowsep": $colSpecification("rowSeparator"),
							"colspan": 1
						}
					else
						map {"colsep": false(), "rowsep": false(), "colspan": 1}

			else
				map {"colsep": true(), "rowsep": true(), "colspan": 1}`,

		// Data
		getNumberOfColumnsXPathQuery: './@cols => number()',
		getRowSpanForCellNodeXPathQuery:
			'let $rowspan := ./@morerows => number() return if ($rowspan) then $rowspan + 1 else 1',
		getColumnSpanForCellNodeXPathQuery: '$columnDataForCell("colspan")',

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
			const startIndexAtZero =
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
				'number(./@colnum)'
			),
			getSpecificationValueStrategies.createGetValueAsNumberStrategy(
				'index',
				'if(./@colnum) then number(./@colnum) else preceding-sibling::' +
					colspec +
					' => count()'
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
					'$columnDataForCell("rowsep")'
			),
			getSpecificationValueStrategies.createGetValueAsBooleanStrategy(
				'columnSeparator',
				'if (./@colsep) then ' +
					'./@colsep = "' +
					this.trueValue +
					'" ' +
					'else ' +
					'$columnDataForCell("colsep")'
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
	const tableElement = evaluateXPathToFirstNode(
		'descendant-or-self::' + this.selectorParts.table,
		node,
		blueprint
	);
	return TableDefinition.prototype.buildTableGridModel.call(this, tableElement, blueprint);
};

CalsTableDefinition.prototype.buildTableGridModelKey = function(node, blueprint) {
	const tableElement = evaluateXPathToFirstNode(
		'descendant-or-self::' + this.selectorParts.table,
		node,
		blueprint
	);
	return TableDefinition.prototype.buildTableGridModelKey.call(this, tableElement, blueprint);
};

CalsTableDefinition.prototype.buildColumnSpecificationsKey = function(tableNode, blueprint) {
	const tableElement = evaluateXPathToFirstNode(
		'descendant-or-self::' + this.selectorParts.table,
		tableNode,
		blueprint
	);
	return TableDefinition.prototype.buildColumnSpecificationsKey.call(this, tableElement);
};

CalsTableDefinition.prototype.applyToDom = function(tableGridModel, tableNode, blueprint, format) {
	let actualTableNode = evaluateXPathToFirstNode(
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
