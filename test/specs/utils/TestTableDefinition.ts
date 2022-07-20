import createCreateCellNodeStrategy from 'fontoxml-table-flow/src/createCreateCellNodeStrategy';
import createCreateRowStrategy from 'fontoxml-table-flow/src/createCreateRowStrategy';
import {
	createConvertFormerHeaderRowNodeStrategy,
	createConvertNormalRowNodeStrategy,
} from 'fontoxml-table-flow/src/normalizeRowNodeStrategies';
import {
	createColumnSpanAsAttributeStrategy,
	createRowSpanAsAttributeStrategy,
} from 'fontoxml-table-flow/src/setAttributeStrategies';
import TableDefinition from 'fontoxml-table-flow/src/TableDefinition';

class TestTableDefinition extends TableDefinition {
	constructor() {
		const tablePartSelectors = {
			table: 'table',
			headerRow: 'headrow',
			row: 'row',
			cell: 'cell',
		};

		// Alias for selector parts
		const head = tablePartSelectors.headerRow;
		const row = tablePartSelectors.row;
		const cell = tablePartSelectors.cell;

		// Properties object
		const properties = {
			tablePartSelectors,

			// Finds
			findHeaderRowNodesXPathQuery: `./${head}`,
			findBodyRowNodesXPathQuery: `./${row}`,
			findCellNodesXPathQuery: `./${cell}`,

			// Data
			getNumberOfColumnsXPathQuery: `(let $cells := (*[self::${row} or self::${head}])[1]/*[self::${cell}] return for $node in $cells return let $colspan := $node/@colspan => number() return if ($colspan) then $colspan else 1) => sum()`,
			getRowSpanForCellNodeXPathQuery:
				'let $rowspan := ./@rowspan return if ($rowspan) then $rowspan => number() else 1',
			getColumnSpanForCellNodeXPathQuery:
				'let $colspan := ./@colspan return if ($colspan) then $colspan => number() else 1',

			// Normalizations
			normalizeRowNodeStrategies: [
				createConvertNormalRowNodeStrategy(null, 'headrow'),
				createConvertFormerHeaderRowNodeStrategy(null, 'row'),
			],

			// Creates
			createCellNodeStrategy: createCreateCellNodeStrategy(null, 'cell'),
			createRowStrategy: createCreateRowStrategy(null, 'row'),

			// Set attributes
			setCellNodeAttributeStrategies: [
				createRowSpanAsAttributeStrategy('rowspan'),
				createColumnSpanAsAttributeStrategy('colspan'),
			],
		};

		super(properties);
	}
}

export default TestTableDefinition;
