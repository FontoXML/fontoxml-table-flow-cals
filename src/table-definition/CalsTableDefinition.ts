import type Blueprint from 'fontoxml-blueprints/src/Blueprint';
import type { FontoElementNode } from 'fontoxml-dom-utils/src/types';
import evaluateXPathToFirstNode from 'fontoxml-selectors/src/evaluateXPathToFirstNode';
import type { XQExpression } from 'fontoxml-selectors/src/types';
import xq, { ensureXQExpression } from 'fontoxml-selectors/src/xq';
import createCreateCellNodeStrategy from 'fontoxml-table-flow/src/createCreateCellNodeStrategy';
import createCreateColumnSpecificationNodeStrategy from 'fontoxml-table-flow/src/createCreateColumnSpecificationNodeStrategy';
import createCreateRowStrategy from 'fontoxml-table-flow/src/createCreateRowStrategy';
import {
	createGetValueAsBooleanStrategy,
	createGetValueAsNumberStrategy,
	createGetValueAsStringStrategy,
} from 'fontoxml-table-flow/src/getSpecificationValueStrategies';
import { createRecreateColumnName } from 'fontoxml-table-flow/src/normalizeColumnSpecificationStrategies';
import {
	createAddBodyContainerNodeStrategy,
	createAddHeaderContainerNodeStrategy,
} from 'fontoxml-table-flow/src/normalizeContainerNodeStrategies';
import {
	createBooleanValueAsAttributeStrategy,
	createColumnCountAsAttributeStrategy,
	createColumnNameAsAttributeStrategy,
	createColumnNumberAsAttributeStrategy,
	createRowSpanAsAttributeStrategy,
	createStringValueAsAttributeStrategy,
} from 'fontoxml-table-flow/src/setAttributeStrategies';
import TableDefinition from 'fontoxml-table-flow/src/TableDefinition';
import type {
	TableContextObject,
	TableDataObject,
	TableDefinitionProperties,
	TableElementsSharedOptions,
} from 'fontoxml-table-flow/src/types';

import type { TableElementsCalsOptions } from '../types';

function parseWidth(width: string): (string | undefined)[] {
	if (width === '*') {
		// '*' is actually '1*'
		return [width, '1', undefined];
	}
	return /(?:(\d*(?:\.\d*)?)\*)?\+?(?:(\d+(?:\.\d*)?)px)?/i.exec(width);
}

function createTableBorderAttributeStrategy(
	parentNodeSelector: XQExpression,
	frameLocalName: string,
	frameValues: { all: string; none: string }
): (
	context: TableContextObject,
	data: TableDataObject,
	blueprint: Blueprint
) => void {
	return function tableBorderAttributeStrategy(context, _data, blueprint) {
		const tableFigureNode = evaluateXPathToFirstNode(
			parentNodeSelector,
			context.node,
			blueprint
		) as FontoElementNode | null;
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

function gcd(x: number, y: number): number {
	while (y) {
		const t = y;
		y = x % y;
		x = t;
	}
	return x;
}

function findGreatestCommonDivisor(input: number[]): number {
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
	showSelectionWidget: false,
	rowBefore: false,
	columnBefore: false,
	showTableWidgetsWhen: 'has-focus',
	useDefaultContextMenu: true,
	isCollapsibleQuery: `false()`,
	isInitiallyCollapsedQuery: `true()`,
	priority: null,

	// Widget menu operations
	columnsWidgetMenuOperations: [
		{
			contents: [
				{ name: 'cals-set-cell-horizontal-alignment-left' },
				{
					name: 'cals-set-cell-horizontal-alignment-center',
				},
				{ name: 'cals-set-cell-horizontal-alignment-right' },
				{
					name: 'cals-set-cell-horizontal-alignment-justify',
				},
			],
		},
		{
			contents: [
				{ name: 'cals-set-cell-vertical-alignment-top' },
				{ name: 'cals-set-cell-vertical-alignment-center' },
				{ name: 'cals-set-cell-vertical-alignment-bottom' },
			],
		},
		{ contents: [{ name: 'cals-set-cell-border-all' }] },
		{ contents: [{ name: 'columns-delete' }] },
	],
	rowsWidgetMenuOperations: [
		{
			contents: [
				{ name: 'cals-set-cell-horizontal-alignment-left' },
				{
					name: 'cals-set-cell-horizontal-alignment-center',
				},
				{ name: 'cals-set-cell-horizontal-alignment-right' },
				{
					name: 'cals-set-cell-horizontal-alignment-justify',
				},
			],
		},
		{
			contents: [
				{ name: 'cals-set-cell-vertical-alignment-top' },
				{ name: 'cals-set-cell-vertical-alignment-center' },
				{ name: 'cals-set-cell-vertical-alignment-bottom' },
			],
		},
		{ contents: [{ name: 'cals-set-cell-border-all' }] },
		{ contents: [{ name: 'rows-delete' }] },
	],
};

function isObject(variable: unknown): variable is { [key: string]: unknown } {
	return (
		variable !== null &&
		typeof variable === 'object' &&
		!Array.isArray(variable)
	);
}

function applyDefaults(
	options: { [key: string]: unknown },
	defaultOptions: { [key: string]: unknown },
	path: string[],
	rootOptions: TableElementsCalsOptions & TableElementsSharedOptions
): { [key: string]: unknown } {
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
					option as { [key: string]: unknown },
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

function getTableDefinitionProperties(
	options: TableElementsCalsOptions & TableElementsSharedOptions
): TableDefinitionProperties {
	options = applyDefaults(
		options,
		DEFAULT_OPTIONS,
		[],
		options
	) as TableElementsCalsOptions & TableElementsSharedOptions;

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

	const colnameAttributeQuery = ensureXQExpression(`@*:${colnameLocalName}`);
	const frameAttributeQuery = ensureXQExpression(`@*:${frameLocalName}`);
	const namestAttributeQuery = ensureXQExpression(`@*:${namestLocalName}`);
	const nameendAttributeQuery = ensureXQExpression(`@*:${nameendLocalName}`);
	const colnumAttributeQuery = ensureXQExpression(`@*:${colnumLocalName}`);
	const colsepAttributeQuery = ensureXQExpression(`@*:${colsepLocalName}`);
	const rowsepAttributeQuery = ensureXQExpression(`@*:${rowsepLocalName}`);
	const alignAttributeQuery = ensureXQExpression(`@*:${alignLocalName}`);
	const valignAttributeQuery = ensureXQExpression(`@*:${valignLocalName}`);
	const colwidthAttributeQuery = ensureXQExpression(
		`@*:${colwidthLocalName}`
	);
	const morerowsAttributeQuery = ensureXQExpression(
		`@*:${morerowsLocalName}`
	);
	const colsAttributeQuery = ensureXQExpression(`@*:${colsLocalName}`);

	// Configurable true/false values
	const trueValue = options.yesOrNo.yesValue;
	const falseValue = options.yesOrNo.noValue;

	const tableFigureFilter = options.tgroup.tableFigureFilterSelector
		? ensureXQExpression(options.tgroup.tableFigureFilterSelector)
		: xq`true()`;
	const tableFigureSelectorPart = xq`${ensureXQExpression(
		`self::Q{${tableFigureNamespaceURI}}${tableFigureLocalName}`
	)}[${tableFigureFilter}]`;
	const tableFigureParentFilter = options.tgroup.tableFigureFilterSelector
		? xq`parent::*[${tableFigureSelectorPart}]`
		: xq`true()`;
	const tablePartSelectors = {
		tableFigure: tableFigureSelectorPart,
		table: xq`${ensureXQExpression(
			`self::Q{${tgroupNamespaceURI}}${tgroupLocalName}`
		)}[${tableFigureParentFilter}]`,
		headerContainer: ensureXQExpression(
			`self::Q{${theadNamespaceURI}}${theadLocalName}`
		),
		bodyContainer: ensureXQExpression(
			`self::Q{${tbodyNamespaceURI}}${tbodyLocalName}`
		),
		row: ensureXQExpression(`self::Q{${rowNamespaceURI}}${rowLocalName}`),
		cell: ensureXQExpression(
			`self::Q{${entryNamespaceURI}}${entryLocalName}`
		),
		columnSpecification: ensureXQExpression(
			`self::Q{${colspecNamespaceURI}}${colspecLocalName}`
		),
	};

	// Alias selector parts
	const tableFigure = tablePartSelectors.tableFigure;
	const thead = tablePartSelectors.headerContainer;
	const tbody = tablePartSelectors.bodyContainer;
	const row = tablePartSelectors.row;
	const entry = tablePartSelectors.cell;
	const colspec = tablePartSelectors.columnSpecification;

	// Properties object
	const properties: TableDefinitionProperties = {
		tablePartSelectors,

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
		divideByTwoStrategy(width: string) {
			const parsedWidth = parseWidth(width);

			const proportion = parseFloat(parsedWidth[1]);
			const fixed = parseFloat(parsedWidth[2]);

			return proportion
				? `${proportion / 2}*`
				: fixed
				? `${fixed / 2}px`
				: '';
		},

		widthsToFractionsStrategy(widths: string[]) {
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

			if (parsedWidths.includes(null)) {
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
		fractionsToWidthsStrategy(fractions: number[]) {
			fractions = fractions.map(function (fraction) {
				return Math.round(fraction * 100);
			});

			const gcd = findGreatestCommonDivisor(fractions);
			return fractions.map((fraction) => {
				return `${fraction / gcd}*`;
			});
		},

		// Header row node selector
		headerRowNodeSelector: xq`${row}[parent::*[${thead}]]`,

		// Finds
		findHeaderRowNodesXPathQuery: xq`child::*[${thead}]/child::*[${row}]`,
		findBodyRowNodesXPathQuery: xq`child::*[${tbody}]/child::*[${row}]`,

		findHeaderContainerNodesXPathQuery: xq`child::*[${thead}]`,
		findBodyContainerNodesXPathQuery: xq`child::*[${tbody}]`,

		findColumnSpecificationNodesXPathQuery: xq`child::*[${colspec}]`,

		findCellNodesXPathQuery: xq`child::*[${entry}]`,

		getColumnIdentifiersXPathQuery: xq`map {"columnName": string(${colnameAttributeQuery}), "namest": string(${namestAttributeQuery}), "nameend": string(${nameendAttributeQuery})}`,

		getColumnDataForCellXPathQuery: xq`
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
		getNumberOfColumnsXPathQuery: xq`${colsAttributeQuery} => number()`,
		getRowSpanForCellNodeXPathQuery: xq`let $rowspan := ${morerowsAttributeQuery} => number() return if ($rowspan) then $rowspan + 1 else 1`,
		getColumnSpanForCellNodeXPathQuery: xq`$columnDataForCell("colspan")`,

		// Normalizations
		normalizeContainerNodeStrategies: [
			createAddHeaderContainerNodeStrategy(
				theadNamespaceURI,
				theadLocalName
			),
			createAddBodyContainerNodeStrategy(
				tbodyNamespaceURI,
				tbodyLocalName
			),
		],

		normalizeColumnSpecificationStrategies: [
			createRecreateColumnName('column'),
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
				xq`./*[${thead} or ${tbody}]`
			),
		createRowStrategy: createCreateRowStrategy(
			rowNamespaceURI,
			rowLocalName
		),

		// Specifications
		getTableSpecificationStrategies: [
			createGetValueAsBooleanStrategy(
				'borders',
				xq`./parent::*[${tableFigure}]/${frameAttributeQuery} = ${options.frame.allValue}`
			),
		],

		getColumnSpecificationStrategies: [
			createGetValueAsBooleanStrategy(
				'columnSeparator',
				xq`let $sep := ${colsepAttributeQuery} return if ($sep) then $sep = ${trueValue} else true()`
			),
			createGetValueAsBooleanStrategy(
				'rowSeparator',
				xq`let $sep := ${rowsepAttributeQuery} return if ($sep) then $sep = ${trueValue} else true()`
			),
			createGetValueAsStringStrategy(
				'horizontalAlignment',
				alignAttributeQuery
			),
			createGetValueAsStringStrategy(
				'columnWidth',
				xq`let $colwidth := ${colwidthAttributeQuery} return if ($colwidth) then $colwidth else "1*"`
			),
			createGetValueAsNumberStrategy(
				'columnNumber',
				xq`number(${colnumAttributeQuery})`
			),
			createGetValueAsNumberStrategy(
				'index',
				xq`if(${colnumAttributeQuery}) then number(${colnumAttributeQuery}) else preceding-sibling::*[name(.)=${colspecLocalName}] => count()`
			),
			createGetValueAsStringStrategy(
				'columnName',
				xq`let $name := ${colnameAttributeQuery} return if ($name) then $name else ("column-", $columnIndex => string()) => string-join()`
			),
		],

		getRowSpecificationStrategies: [
			createGetValueAsStringStrategy(
				'verticalAlignment',
				xq`let $valign := ./@*[name(.)=${valignLocalName}] return if ($valign) then $valign else "bottom"`,
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
			createGetValueAsStringStrategy(
				'horizontalAlignment',
				alignAttributeQuery,
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
			createGetValueAsStringStrategy(
				'verticalAlignment',
				valignAttributeQuery,
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
			createGetValueAsBooleanStrategy(
				'rowSeparator',
				xq`if (${rowsepAttributeQuery}) then
					${rowsepAttributeQuery} = ${trueValue}
				else
					$columnDataForCell("rowsep")`
			),

			createGetValueAsBooleanStrategy(
				'columnSeparator',
				xq`if (${colsepAttributeQuery}) then
					${colsepAttributeQuery} = ${trueValue}
				else
					$columnDataForCell("colsep")`
			),
			createGetValueAsStringStrategy('columnName', colnameAttributeQuery),
			createGetValueAsStringStrategy('nameEnd', nameendAttributeQuery),
			createGetValueAsStringStrategy('nameStart', namestAttributeQuery),
		],

		// Set attributes
		setTableNodeAttributeStrategies: [
			createColumnCountAsAttributeStrategy(colsLocalName),
			createTableBorderAttributeStrategy(
				xq`./parent::*[${tableFigure}]`,
				frameLocalName,
				frameValues
			),
		],

		setColumnSpecificationNodeAttributeStrategies: [
			createStringValueAsAttributeStrategy(
				colnameLocalName,
				'columnName'
			),
			createColumnNumberAsAttributeStrategy(colnumLocalName, 1),
			createBooleanValueAsAttributeStrategy(
				colsepLocalName,
				'columnSeparator',
				true,
				trueValue,
				falseValue
			),
			createBooleanValueAsAttributeStrategy(
				rowsepLocalName,
				'rowSeparator',
				true,
				trueValue,
				falseValue
			),
			createStringValueAsAttributeStrategy(
				alignLocalName,
				'horizontalAlignment',
				undefined,
				(value) =>
					attributeValuesByAttributeName.get('horizontalAlignment')[
						value
					]
			),
			createStringValueAsAttributeStrategy(
				colwidthLocalName,
				'columnWidth'
			),
		],

		setCellNodeAttributeStrategies: [
			createBooleanValueAsAttributeStrategy(
				rowsepLocalName,
				'rowSeparator',
				true,
				trueValue,
				falseValue
			),
			createBooleanValueAsAttributeStrategy(
				colsepLocalName,
				'columnSeparator',
				true,
				trueValue,
				falseValue
			),
			createColumnNameAsAttributeStrategy(
				colnameLocalName,
				namestLocalName,
				nameendLocalName
			),
			createRowSpanAsAttributeStrategy(morerowsLocalName, true),
			createStringValueAsAttributeStrategy(
				alignLocalName,
				'horizontalAlignment',
				undefined,
				(value) =>
					attributeValuesByAttributeName.get('horizontalAlignment')[
						value
					]
			),
			createStringValueAsAttributeStrategy(
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
		columnsWidgetMenuOperations: options.columnsWidgetMenuOperations,
		rowsWidgetMenuOperations: options.rowsWidgetMenuOperations,
	};

	return properties;
}

/**
 * @remarks
 * Configures the table definition for CALS tables.
 */
export default class CalsTableDefinition extends TableDefinition {
	private readonly _options: TableElementsCalsOptions &
		TableElementsSharedOptions;

	private readonly _tgroupNamespaceURI: string;

	private readonly _tgroupLocalName: string;

	private readonly _tableSelector: XQExpression;

	public colsepLocalName: string;

	public rowsepLocalName: string;

	public trueValue: string;

	public falseValue: string;

	/**
	 * @param options -
	 */
	public constructor(options: TableElementsCalsOptions) {
		const properties = getTableDefinitionProperties(options);
		super(properties);
		this._options = applyDefaults(
			options,
			DEFAULT_OPTIONS,
			[],
			options
		) as TableElementsCalsOptions & TableElementsSharedOptions;
		this._tgroupNamespaceURI = this._options.tgroup.namespaceURI || '';
		this._tgroupLocalName = this._options.tgroup.localName;
		this._tableSelector = properties.tablePartSelectors.table;

		// This attribute names are required at other places
		this.colsepLocalName = this._options.colsep.localName;
		this.rowsepLocalName = this._options.rowsep.localName;

		// Configurable true/false values
		this.trueValue = this._options.yesOrNo.yesValue;
		this.falseValue = this._options.yesOrNo.noValue;
	}
}
