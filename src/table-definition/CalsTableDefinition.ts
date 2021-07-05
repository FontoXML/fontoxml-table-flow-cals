import type Blueprint from 'fontoxml-blueprints/src/Blueprint';
import namespaceManager from 'fontoxml-dom-namespaces/src/namespaceManager';
import type { FontoNode } from 'fontoxml-dom-utils/src/types';
import evaluateXPathToFirstNode from 'fontoxml-selectors/src/evaluateXPathToFirstNode';
import createCreateCellNodeStrategy from 'fontoxml-table-flow/src/createCreateCellNodeStrategy';
import createCreateColumnSpecificationNodeStrategy from 'fontoxml-table-flow/src/createCreateColumnSpecificationNodeStrategy';
import createCreateRowStrategy from 'fontoxml-table-flow/src/createCreateRowStrategy';
import getSpecificationValueStrategies from 'fontoxml-table-flow/src/getSpecificationValueStrategies';
import normalizeColumnSpecificationStrategies from 'fontoxml-table-flow/src/normalizeColumnSpecificationStrategies';
import normalizeContainerNodeStrategies from 'fontoxml-table-flow/src/normalizeContainerNodeStrategies';
import setAttributeStrategies from 'fontoxml-table-flow/src/setAttributeStrategies';
import TableDefinition from 'fontoxml-table-flow/src/TableDefinition';
import type TableGridModel from 'fontoxml-table-flow/src/TableGridModel/TableGridModel';
import type { CalsTableOptions } from 'fontoxml-typescript-migration-debt/src/types';

function parseWidth(width: $TSFixMeAny): $TSFixMeAny {
	if (width === '*') {
		// '*' is actually '1*'
		return [width, '1', undefined];
	}
	return /(?:(\d*(?:\.\d*)?)\*)?\+?(?:(\d+(?:\.\d*)?)px)?/i.exec(width);
}

function createTableBorderAttributeStrategy(
	parentNodeSelector: $TSFixMeAny,
	frameLocalName: $TSFixMeAny,
	frameValues: $TSFixMeAny
): $TSFixMeAny {
	return function tableBorderAttributeStrategy(context, _data, blueprint) {
		const tableFigureNode = evaluateXPathToFirstNode(
			parentNodeSelector,
			context.node,
			blueprint
		);
		if (tableFigureNode) {
			blueprint.setAttribute(
				tableFigureNode,
				frameLocalName,
				context.specification.borders
					? frameValues.all
					: frameValues.none
			);
		}
	};
}

function gcd(x: $TSFixMeAny, y: $TSFixMeAny): $TSFixMeAny {
	while (y) {
		const t = y;
		y = x % y;
		x = t;
	}
	return x;
}

function findGreatestCommonDivisor(input: $TSFixMeAny): $TSFixMeAny {
	let a = input[0];
	let b;
	for (let i = 1; i < input.length; i++) {
		b = input[i];
		a = gcd(a, b);
	}
	return a;
}

const FALLBACK_TO_TGROUP = Symbol('fallback');

const DEFAULT_OPTIONS = {
	align: {
		localName: 'align',
		leftValue: 'left',
		rightValue: 'right',
		centerValue: 'center',
		justifyValue: 'justify',
	},

	colname: { localName: 'colname' },

	colnum: { localName: 'colnum' },

	cols: { localName: 'cols' },

	colsep: { localName: 'colsep' },

	colspec: {
		localName: 'colspec',
		// Will default to tgroup namespaceURI first
		namespaceURI: FALLBACK_TO_TGROUP,
	},

	colwidth: { localName: 'colwidth' },

	entry: {
		localName: 'entry',
		// Will default to tgroup namespaceURI first
		namespaceURI: FALLBACK_TO_TGROUP,
		defaultTextContainer: null,
	},

	frame: { localName: 'frame', allValue: 'all', noneValue: 'none' },

	morerows: { localName: 'morerows' },

	nameend: { localName: 'nameend' },

	namest: { localName: 'namest' },

	row: {
		localName: 'row',
		// Will default to tgroup namespaceURI first
		namespaceURI: FALLBACK_TO_TGROUP,
	},

	rowsep: { localName: 'rowsep' },

	table: {
		localName: undefined,
		namespaceURI: null,
	},

	tbody: {
		localName: 'tbody',
		namespaceURI: FALLBACK_TO_TGROUP,
	},

	tgroup: {
		localName: 'tgroup',
		namespaceURI: FALLBACK_TO_TGROUP,
		tableFigureFilterSelector: '',
	},

	thead: {
		localName: 'thead',
		// Will default to tgroup namespaceURI first
		namespaceURI: FALLBACK_TO_TGROUP,
	},

	valign: {
		localName: 'valign',
		topValue: 'top',
		middleValue: 'middle',
		bottomValue: 'bottom',
	},

	// Is used in multiple places
	yesOrNo: {
		yesValue: '1',
		noValue: '0',
	},

	showInsertionWidget: false,
	showHighlightingWidget: false,
	rowBefore: false,
	columnBefore: false,
	useDefaultContextMenu: true,
	isCollapsibleQuery: 'false()',
	isInitiallyCollapsedQuery: 'true()',
	priority: null,

	// Widget menu operations
	columnWidgetMenuOperations: [
		{
			contents: [
				{ name: 'contextual-cals-set-cell-horizontal-alignment-left' },
				{
					name: 'contextual-cals-set-cell-horizontal-alignment-center',
				},
				{ name: 'contextual-cals-set-cell-horizontal-alignment-right' },
				{
					name: 'contextual-cals-set-cell-horizontal-alignment-justify',
				},
			],
		},
		{
			contents: [
				{ name: 'contextual-cals-set-cell-vertical-alignment-top' },
				{ name: 'contextual-cals-set-cell-vertical-alignment-center' },
				{ name: 'contextual-cals-set-cell-vertical-alignment-bottom' },
			],
		},
		{ contents: [{ name: 'contextual-cals-toggle-cell-border-all' }] },
		{ contents: [{ name: 'column-delete-at-index' }] },
	],
	rowWidgetMenuOperations: [
		{
			contents: [
				{ name: 'contextual-cals-set-cell-horizontal-alignment-left' },
				{
					name: 'contextual-cals-set-cell-horizontal-alignment-center',
				},
				{ name: 'contextual-cals-set-cell-horizontal-alignment-right' },
				{
					name: 'contextual-cals-set-cell-horizontal-alignment-justify',
				},
			],
		},
		{
			contents: [
				{ name: 'contextual-cals-set-cell-vertical-alignment-top' },
				{ name: 'contextual-cals-set-cell-vertical-alignment-center' },
				{ name: 'contextual-cals-set-cell-vertical-alignment-bottom' },
			],
		},
		{ contents: [{ name: 'contextual-cals-toggle-cell-border-all' }] },
		{ contents: [{ name: 'contextual-row-delete' }] },
	],
};

function isObject(variable: $TSFixMeAny): $TSFixMeAny {
	return (
		variable !== null &&
		typeof variable === 'object' &&
		!Array.isArray(variable)
	);
}

function applyDefaults(
	options: $TSFixMeAny,
	defaultOptions: $TSFixMeAny,
	path: $TSFixMeAny,
	rootOptions: $TSFixMeAny
): $TSFixMeAny {
	const newOptions = {};
	for (const defaultOptionKey of Object.keys(defaultOptions)) {
		const defaultOption = defaultOptions[defaultOptionKey];

		if (!(defaultOptionKey in options)) {
			if (isObject(defaultOption)) {
				newOptions[defaultOptionKey] = applyDefaults(
					{},
					defaultOption,
					[...path, defaultOptionKey],
					rootOptions
				);
				continue;
			}

			if (defaultOption === FALLBACK_TO_TGROUP) {
				// Fall back to the TGROUP namespace uri
				if (rootOptions.tgroup && rootOptions.tgroup.namespaceURI) {
					newOptions[defaultOptionKey] =
						rootOptions.tgroup.namespaceURI;
					continue;
				}
				newOptions[defaultOptionKey] = null;
				continue;
			}

			newOptions[defaultOptionKey] = defaultOption;
		} else {
			const option = options[defaultOptionKey];

			if (isObject(defaultOption)) {
				newOptions[defaultOptionKey] = applyDefaults(
					option,
					defaultOption,
					[...path, defaultOptionKey],
					rootOptions
				);
				continue;
			}

			newOptions[defaultOptionKey] = option;
		}
	}

	// Sanity check, there should not be additional values set. If they are, someone is doing
	// something wrong
	for (const optionKey of Object.keys(options)) {
		if (!(optionKey in defaultOptions)) {
			throw new Error(
				`The option ${optionKey} in ${path.join(
					'.'
				)} is not supported. Please refer to the API docs of https://documentation.fontoxml.com/latest/fontoxml-table-flow-cals-09573b5e811b to see which options are supported.`
			);
		}
	}

	return newOptions;
}

function getTableDefinitionProperties(options: $TSFixMeAny): $TSFixMeAny {
	options = applyDefaults(options, DEFAULT_OPTIONS, [], options);

	const attributeValuesByAttributeName = new Map();
	const alignValues = {
		left: options.align.leftValue,
		right: options.align.rightValue,
		center: options.align.centerValue,
		justify: options.align.justifyValue,
	};
	attributeValuesByAttributeName.set('horizontalAlignment', alignValues);

	const valignValues = {
		top: options.valign.topValue,
		middle: options.valign.middleValue,
		bottom: options.valign.bottomValue,
	};
	attributeValuesByAttributeName.set('verticalAlignment', valignValues);

	const frameValues = {
		all: options.frame.allValue,
		none: options.frame.noneValue,
	};
	attributeValuesByAttributeName.set('border', frameValues);

	// Configurable element names
	const tableFigureLocalName = options.table.localName;
	const tgroupLocalName = options.tgroup.localName;
	const colspecLocalName = options.colspec.localName;
	const theadLocalName = options.thead.localName;
	const tbodyLocalName = options.tbody.localName;
	const rowLocalName = options.row.localName;
	const entryLocalName = options.entry.localName;

	// Configurable namespace URIs
	const tableFigureNamespaceURI = options.table.namespaceURI || '';
	const colspecNamespaceURI = options.colspec.namespaceURI || '';
	const tgroupNamespaceURI = options.tgroup.namespaceURI || '';
	const theadNamespaceURI = options.thead.namespaceURI || '';
	const tbodyNamespaceURI = options.tbody.namespaceURI || '';
	const rowNamespaceURI = options.row.namespaceURI || '';
	const entryNamespaceURI = options.entry.namespaceURI || '';

	// Various attribute names
	const colnameLocalName = options.colname.localName;
	const frameLocalName = options.frame.localName;
	const namestLocalName = options.namest.localName;
	const nameendLocalName = options.nameend.localName;
	const colnumLocalName = options.colnum.localName;
	const colsepLocalName = options.colsep.localName;
	const rowsepLocalName = options.rowsep.localName;
	const alignLocalName = options.align.localName;
	const valignLocalName = options.valign.localName;
	const colwidthLocalName = options.colwidth.localName;
	const morerowsLocalName = options.morerows.localName;
	const colsLocalName = options.cols.localName;

	// Configurable true/false values
	const trueValue = options.yesOrNo.yesValue;
	const falseValue = options.yesOrNo.noValue;

	const tableFigureFilter = options.tgroup.tableFigureFilterSelector
		? `[${options.tgroup.tableFigureFilterSelector}]`
		: '';
	const tableFigureSelectorPart = `Q{${tableFigureNamespaceURI}}${tableFigureLocalName}${tableFigureFilter}`;
	const tableFigureParentFilter = tableFigureFilter
		? `[parent::${tableFigureSelectorPart}]`
		: '';
	const selectorParts = {
		tableFigure: tableFigureSelectorPart,
		table: `Q{${tgroupNamespaceURI}}${tgroupLocalName}${tableFigureParentFilter}`,
		headerContainer: `Q{${theadNamespaceURI}}${theadLocalName}`,
		bodyContainer: `Q{${tbodyNamespaceURI}}${tbodyLocalName}`,
		row: `Q{${rowNamespaceURI}}${rowLocalName}`,
		cell: `Q{${entryNamespaceURI}}${entryLocalName}`,
		columnSpecification: `Q{${colspecNamespaceURI}}${colspecLocalName}`,
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
		selectorParts,

		supportsBorders: true,
		supportsCellBorder: true,
		supportsCellAlignment: true,
		supportsRowSpanningCellsAtBottom: false,

		// Widths
		widthToHtmlWidthStrategy(width, widths) {
			const proportion = parseFloat(parseWidth(width)[1]) || 1;
			const totalProportion = widths.reduce(function (total, proportion) {
				return total + (parseFloat(parseWidth(proportion)[1]) || 1);
			}, 0);

			return `${(100 * proportion) / totalProportion}%`;
		},
		addWidthsStrategy(width1, width2) {
			const parsedWidth1 = parseWidth(width1);
			const proportion1 = parseFloat(parsedWidth1[1]) || 0;
			const fixed1 = parseFloat(parsedWidth1[2]) || 0;

			const parsedWidth2 = parseWidth(width2);
			const proportion2 = parseFloat(parsedWidth2[1]) || 0;
			const fixed2 = parseFloat(parsedWidth2[2]) || 0;

			const proportion = proportion1 + proportion2;
			const fixed = fixed1 + fixed2;

			return proportion !== 0
				? `${proportion}*`
				: fixed !== 0
				? `${fixed}px`
				: '';
		},
		divideWidthByTwoStrategy(width) {
			const parsedWidth = parseWidth(width);

			const proportion = parseFloat(parsedWidth[1]);
			const fixed = parseFloat(parsedWidth[2]);

			return proportion
				? `${proportion / 2}*`
				: fixed
				? `${fixed / 2}px`
				: '';
		},

		widthsToFractionsStrategy(widths) {
			const parsedWidths = widths.map(function (width) {
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
				return parsedWidths.map(function () {
					return 1 / parsedWidths.length;
				});
			}

			const totalWidth = parsedWidths.reduce(function (total, width) {
				return total + width;
			}, 0);

			return parsedWidths.map(function (width) {
				return width / totalWidth;
			});
		},
		fractionsToWidthsStrategy(fractions) {
			fractions = fractions.map(function (fraction) {
				return Math.round(fraction * 100);
			});

			const gcd = findGreatestCommonDivisor(fractions);
			return fractions.map((fraction) => {
				return `${fraction / gcd}*`;
			});
		},

		// Header row node selector
		headerRowNodeSelector: `self::${row}[parent::${thead}]`,

		// Finds
		findHeaderRowNodesXPathQuery: `./${thead}/${row}`,
		findBodyRowNodesXPathQuery: `./${tbody}/${row}`,
		findFooterRowNodesXPathQuery: `./${tfoot}/${row}`,

		findHeaderContainerNodesXPathQuery: `./${thead}`,
		findBodyContainerNodesXPathQuery: `./${tbody}`,

		findColumnSpecificationNodesXPathQuery: `./${colspec}`,

		findCellNodesXPathQuery: `./${entry}`,

		getColumnIdentifiersXPathQuery: `map {"columnName": string(./@${colnameLocalName}), "namest": string(./@${namestLocalName}), "nameend": string(./@${nameendLocalName})}`,

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
		getNumberOfColumnsXPathQuery: `./@${colsLocalName} => number()`,
		getRowSpanForCellNodeXPathQuery: `let $rowspan := ./@${morerowsLocalName} => number() return if ($rowspan) then $rowspan + 1 else 1`,
		getColumnSpanForCellNodeXPathQuery: '$columnDataForCell("colspan")',

		// Normalizations
		normalizeContainerNodeStrategies: [
			normalizeContainerNodeStrategies.createAddHeaderContainerNodeStrategy(
				theadNamespaceURI,
				theadLocalName
			),
			normalizeContainerNodeStrategies.createAddBodyContainerNodeStrategy(
				tbodyNamespaceURI,
				tbodyLocalName
			),
		],

		normalizeColumnSpecificationStrategies: [
			normalizeColumnSpecificationStrategies.createRecreateColumnName(
				'column'
			),
		],
		findNextColumnSpecification(
			columnIndex,
			columnSpecification,
			columnSpecificationIndex,
			columnSpecifications
		) {
			const startIndexAtZero =
				columnSpecifications[0] &&
				columnSpecifications[0].columnNumber === 0;
			return (
				columnSpecification.columnNumber ===
					(startIndexAtZero ? columnIndex : columnIndex + 1) ||
				(columnSpecification.columnNumber !== undefined &&
					columnSpecificationIndex >= columnIndex)
			);
		},

		// Defaults
		getDefaultColumnSpecificationStrategy(context) {
			return {
				columnName: `column-${context.columnIndex}`,
				columnNumber: context.columnIndex + 1,
				columnWidth: '1*',
				rowSeparator: true,
				columnSeparator: true,
			};
		},
		getDefaultCellSpecificationStrategy(context) {
			return {
				width: '1*',
				columnName: `column-${context.columnIndex}`,
				rowSeparator: true,
				columnSeparator: true,
			};
		},

		// Create elements
		createCellNodeStrategy: createCreateCellNodeStrategy(
			entryNamespaceURI,
			entryLocalName
		),
		createColumnSpecificationNodeStrategy:
			createCreateColumnSpecificationNodeStrategy(
				colspecNamespaceURI,
				colspecLocalName,
				`./*[self::${thead} or self::${tbody}]`
			),
		createRowStrategy: createCreateRowStrategy(
			rowNamespaceURI,
			rowLocalName
		),

		// Specifications
		getTableSpecificationStrategies: [
			getSpecificationValueStrategies.createGetValueAsBooleanStrategy(
				'borders',
				`./parent::${tableFigure}/@${frameLocalName} = "${options.frame.allValue}"`
			),
		],

		getColumnSpecificationStrategies: [
			getSpecificationValueStrategies.createGetValueAsBooleanStrategy(
				'columnSeparator',
				`let $sep := ./@${colsepLocalName} return if ($sep) then $sep = "${trueValue}" else true()`
			),
			getSpecificationValueStrategies.createGetValueAsBooleanStrategy(
				'rowSeparator',
				`let $sep := ./@${rowsepLocalName} return if ($sep) then $sep = "${trueValue}" else true()`
			),
			getSpecificationValueStrategies.createGetValueAsStringStrategy(
				'horizontalAlignment',
				`./@${alignLocalName}`
			),
			getSpecificationValueStrategies.createGetValueAsStringStrategy(
				'columnWidth',
				`let $colwidth := ./@${colwidthLocalName} return if ($colwidth) then $colwidth else "1*"`
			),
			getSpecificationValueStrategies.createGetValueAsNumberStrategy(
				'columnNumber',
				`number(./@${colnumLocalName})`
			),
			getSpecificationValueStrategies.createGetValueAsNumberStrategy(
				'index',
				`if(./@${colnumLocalName}) then number(./@${colnumLocalName}) else preceding-sibling::${colspecLocalName} => count()`
			),
			getSpecificationValueStrategies.createGetValueAsStringStrategy(
				'columnName',
				`let $name := ./@${colnameLocalName} return if ($name) then $name else ("column-", $columnIndex => string()) => string-join()`
			),
		],

		getRowSpecificationStrategies: [
			getSpecificationValueStrategies.createGetValueAsStringStrategy(
				'verticalAlignment',
				`let $valign := ./@${valignLocalName} return if ($valign) then $valign else "bottom"`,
				(value) => {
					const verticalAlignmentValuesByKey =
						attributeValuesByAttributeName.get('verticalAlignment');
					return Object.keys(verticalAlignmentValuesByKey).find(
						(verticalAlignmentKey) =>
							verticalAlignmentValuesByKey[
								verticalAlignmentKey
							] === value
					);
				}
			),
		],

		getCellSpecificationStrategies: [
			// first option
			getSpecificationValueStrategies.createGetValueAsStringStrategy(
				'horizontalAlignment',
				`./@${alignLocalName}`,
				(value) => {
					const horizontalAlignmentValuesByKey =
						attributeValuesByAttributeName.get(
							'horizontalAlignment'
						);
					return Object.keys(horizontalAlignmentValuesByKey).find(
						(horizontalAlignmentKey) =>
							horizontalAlignmentValuesByKey[
								horizontalAlignmentKey
							] === value
					);
				}
			),
			// second option
			getSpecificationValueStrategies.createGetValueAsStringStrategy(
				'verticalAlignment',
				`./@${valignLocalName}`,
				(value) => {
					const verticalAlignmentValuesByKey =
						attributeValuesByAttributeName.get('verticalAlignment');
					return Object.keys(verticalAlignmentValuesByKey).find(
						(verticalAlignmentKey) =>
							verticalAlignmentValuesByKey[
								verticalAlignmentKey
							] === value
					);
				}
			),
			getSpecificationValueStrategies.createGetValueAsBooleanStrategy(
				'rowSeparator',
				`if (./@${rowsepLocalName}) then
					./@${rowsepLocalName} = "${trueValue}"
				else
					$columnDataForCell("rowsep")`
			),

			getSpecificationValueStrategies.createGetValueAsBooleanStrategy(
				'columnSeparator',
				`if (./@${colsepLocalName}) then
					./@${colsepLocalName} = "${trueValue}"
				else
					$columnDataForCell("colsep")`
			),
			getSpecificationValueStrategies.createGetValueAsStringStrategy(
				'columnName',
				`./@${colnameLocalName}`
			),
			getSpecificationValueStrategies.createGetValueAsStringStrategy(
				'nameEnd',
				`./@${nameendLocalName}`
			),
			getSpecificationValueStrategies.createGetValueAsStringStrategy(
				'nameStart',
				`./@${namestLocalName}`
			),
		],

		// Set attributes
		setTableNodeAttributeStrategies: [
			setAttributeStrategies.createColumnCountAsAttributeStrategy(
				colsLocalName
			),
			createTableBorderAttributeStrategy(
				`./parent::${tableFigure}`,
				frameLocalName,
				frameValues
			),
		],

		setColumnSpecificationNodeAttributeStrategies: [
			setAttributeStrategies.createStringValueAsAttributeStrategy(
				colnameLocalName,
				'columnName'
			),
			setAttributeStrategies.createColumnNumberAsAttributeStrategy(
				colnumLocalName,
				1
			),
			setAttributeStrategies.createBooleanValueAsAttributeStrategy(
				colsepLocalName,
				'columnSeparator',
				trueValue,
				trueValue,
				falseValue
			),
			setAttributeStrategies.createBooleanValueAsAttributeStrategy(
				rowsepLocalName,
				'rowSeparator',
				trueValue,
				trueValue,
				falseValue
			),
			setAttributeStrategies.createStringValueAsAttributeStrategy(
				alignLocalName,
				'horizontalAlignment',
				undefined,
				(value) =>
					attributeValuesByAttributeName.get('horizontalAlignment')[
						value
					]
			),
			setAttributeStrategies.createStringValueAsAttributeStrategy(
				colwidthLocalName,
				'columnWidth'
			),
		],

		setCellNodeAttributeStrategies: [
			setAttributeStrategies.createBooleanValueAsAttributeStrategy(
				rowsepLocalName,
				'rowSeparator',
				trueValue,
				trueValue,
				falseValue
			),
			setAttributeStrategies.createBooleanValueAsAttributeStrategy(
				colsepLocalName,
				'columnSeparator',
				trueValue,
				trueValue,
				falseValue
			),
			setAttributeStrategies.createColumnNameAsAttributeStrategy(
				colnameLocalName,
				namestLocalName,
				nameendLocalName
			),
			setAttributeStrategies.createRowSpanAsAttributeStrategy(
				morerowsLocalName,
				true
			),
			setAttributeStrategies.createStringValueAsAttributeStrategy(
				alignLocalName,
				'horizontalAlignment',
				undefined,
				(value) =>
					attributeValuesByAttributeName.get('horizontalAlignment')[
						value
					]
			),
			setAttributeStrategies.createStringValueAsAttributeStrategy(
				valignLocalName,
				'verticalAlignment',
				undefined,
				(value) =>
					attributeValuesByAttributeName.get('verticalAlignment')[
						value
					]
			),
		],

		// Widget menu operations
		columnWidgetMenuOperations: options.columnWidgetMenuOperations,
		rowWidgetMenuOperations: options.rowWidgetMenuOperations,
	};

	return properties;
}

/**
 * Configures the table definition for CALS tables.
 */
export default class CalsTableDefinition extends TableDefinition {
	_options: $TSFixMeAny;

	_tgroupNamespaceURI: $TSFixMeAny;

	_tgroupLocalName: $TSFixMeAny;

	colsepLocalName: $TSFixMeAny;

	rowsepLocalName: $TSFixMeAny;

	trueValue: $TSFixMeAny;

	falseValue: $TSFixMeAny;

	/**
	 * @param {CalsTableOptions} options
	 */
	constructor(options: CalsTableOptions) {
		super(getTableDefinitionProperties(options));
		this._options = applyDefaults(options, DEFAULT_OPTIONS, [], options);
		this._tgroupNamespaceURI = this._options.tgroup.namespaceURI || '';
		this._tgroupLocalName = this._options.tgroup.localName;

		// This attribute names are required at other places
		this.colsepLocalName = this._options.colsep.localName;
		this.rowsepLocalName = this._options.rowsep.localName;

		// Configurable true/false values
		this.trueValue = this._options.yesOrNo.yesValue;
		this.falseValue = this._options.yesOrNo.noValue;
	}

	/**
	 * @param  {Node}      node      The node to deserialize
	 * @param  {Blueprint} blueprint The blueprint to use
	 * @return {TableGridModel}
	 */
	buildTableGridModel(node: FontoNode, blueprint: Blueprint): TableGridModel {
		const tableElement = evaluateXPathToFirstNode(
			`descendant-or-self::${this.selectorParts.table}`,
			node,
			blueprint
		);
		return TableDefinition.prototype.buildTableGridModel.call(
			this,
			tableElement,
			blueprint
		);
	}

	/**
	 * @param  {TableGridModel} tableGridModel The TableGridModel to serialize
	 * @param  {Node}           tableNode      The node to serialize to
	 * @param  {Blueprint}      blueprint      The blueprint to use
	 * @param  {Format}         format         The format to use
	 * @return {boolean}
	 */
	applyToDom(
		tableGridModel: TableGridModel,
		tableNode: FontoNode,
		blueprint: Blueprint,
		format: Format
	): boolean {
		let actualTableNode = evaluateXPathToFirstNode(
			`descendant-or-self::${this.selectorParts.table}`,
			tableNode,
			blueprint
		);
		if (!actualTableNode) {
			actualTableNode = blueprint.appendChild(
				tableNode,
				namespaceManager.createElementNS(
					tableNode.ownerDocument,
					this._tgroupNamespaceURI,
					this._tgroupLocalName
				)
			);
		}
		return TableDefinition.prototype.applyToDom.call(
			this,
			tableGridModel,
			actualTableNode,
			blueprint,
			format
		);
	}
}
