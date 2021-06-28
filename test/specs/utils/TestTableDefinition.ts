import TableDefinition from 'fontoxml-table-flow/src/TableDefinition';
import createCreateCellNodeStrategy from 'fontoxml-table-flow/src/createCreateCellNodeStrategy';
import createCreateRowStrategy from 'fontoxml-table-flow/src/createCreateRowStrategy';
import normalizeRowNodeStrategies from 'fontoxml-table-flow/src/normalizeRowNodeStrategies';
import setAttributeStrategies from 'fontoxml-table-flow/src/setAttributeStrategies';

class TestTableDefinition extends TableDefinition {
	constructor() {
		const selectorParts = {
			table: 'table',
			headerRow: 'headrow',
			row: 'row',
			cell: 'cell',
		};

		// Alias for selector parts
		const head = selectorParts.headerRow;
		const row = selectorParts.row;
		const cell = selectorParts.cell;

		// Properties object
		const properties = {
			selectorParts: selectorParts,

			// Finds
			findHeaderRowNodesXPathQuery: './' + head,
			findBodyRowNodesXPathQuery: './' + row,
			findCellNodesXPathQuery: './' + cell,

			// Data
			getNumberOfColumnsXPathQuery:
				'(let $cells := (*[self::' +
				row +
				' or self::' +
				head +
				'])[1]/*[self::' +
				cell +
				'] return for $node in $cells return let $colspan := $node/@colspan => number() return if ($colspan) then $colspan else 1) => sum()',
			getRowSpanForCellNodeXPathQuery:
				'let $rowspan := ./@rowspan return if ($rowspan) then $rowspan => number() else 1',
			getColumnSpanForCellNodeXPathQuery:
				'let $colspan := ./@colspan return if ($colspan) then $colspan => number() else 1',

			// Normalizations
			normalizeRowNodeStrategies: [
				normalizeRowNodeStrategies.createConvertNormalRowNodeStrategy(
					null,
					'headrow'
				),
				normalizeRowNodeStrategies.createConvertFormerHeaderRowNodeStrategy(
					null,
					'row'
				),
			],

			// Creates
			createCellNodeStrategy: createCreateCellNodeStrategy(null, 'cell'),
			createRowStrategy: createCreateRowStrategy(null, 'row'),

			// Set attributes
			setCellNodeAttributeStrategies: [
				setAttributeStrategies.createRowSpanAsAttributeStrategy(
					'rowspan'
				),
				setAttributeStrategies.createColumnSpanAsAttributeStrategy(
					'colspan'
				),
			],
		};

		super(properties);
	}
}

export default TestTableDefinition;
