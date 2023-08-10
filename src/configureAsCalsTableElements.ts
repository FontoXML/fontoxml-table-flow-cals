import type { SxModule } from 'fontoxml-modular-schema-experience/src/sxManager';
import configureAsTableElements from 'fontoxml-table-flow/src/configureAsTableElements';
import type { TableElementsSharedOptions } from 'fontoxml-table-flow/src/types';

import CalsTableDefinition from './table-definition/CalsTableDefinition';
import type { TableElementsCalsOptions } from './types';

/**
 * @remarks
 * Configure the cals table implementation
 *
 * Check {@link
 * fonto-documentation/docs/configure/elements/configure-tables.xml#id-d8cde415-f9e0-ba0c-14a5-cdb5f92d647d
 * | our guide} for more information on table widgets. Example usage for the table
 * widgets:
 *
 *```
 *	configureAsCalsTableElements(sxModule, {
 *		table: {
 *			localName: 'table'
 *		},
 *		entry: {
 *			defaultTextContainer: 'p'
 *		},
 *		columnBefore: [
 *			createIconWidget('clock-o', {
 *				clickOperation: 'lcTime-value-edit',
 *				tooltipContent: 'Click here to edit the duration'
 *			})
 *		],
 *		rowBefore: [
 *			createIconWidget('dot-circle-o', {
 *				clickOperation: 'do-nothing'
 *			})
 *		],
 *		showInsertionWidget: true,
 *		showSelectionWidget: true,
 *		columnsWidgetMenuOperations: [
 *			{
 *				contents: [
 *					{ name: 'cals-set-cell-horizontal-alignment-left' },
 *					{ name: 'cals-set-cell-horizontal-alignment-center' },
 *					{ name: 'cals-set-cell-horizontal-alignment-right' },
 *					{ name: 'cals-set-cell-horizontal-alignment-justify' }
 *				]
 *			},
 *			{
 *				contents: [
 *					{ name: 'cals-set-cell-vertical-alignment-top' },
 *					{ name: 'cals-set-cell-vertical-alignment-center' },
 *					{ name: 'cals-set-cell-vertical-alignment-bottom' }
 *				]
 *			},
 *			{ contents: [{ name: 'columns-delete' }] }
 *		],
 *		rowsWidgetMenuOperations: [
 *			{
 *				contents: [
 *					{ name: 'cals-set-cell-horizontal-alignment-left' },
 *					{ name: 'cals-set-cell-horizontal-alignment-center' },
 *					{ name: 'cals-set-cell-horizontal-alignment-right' },
 *					{ name: 'cals-set-cell-horizontal-alignment-justify' }
 *				]
 *			},
 *			{
 *				contents: [
 *					{ name: 'cals-set-cell-vertical-alignment-top' },
 *					{ name: 'cals-set-cell-vertical-alignment-center' },
 *					{ name: 'cals-set-cell-vertical-alignment-bottom' }
 *				]
 *			},
 *			{ contents: [{ name: 'rows-delete' }] }
 *		]
 *	});
 *```
 *
 * It is also possible to configure all element names and attributes, and attribute
 * names and possible values.
 *
 * ```
 * configureAsCalsTableElements(sxModule, {
 * 	// Priority of the selectors used to select the table elements (Optional)
 * 	priority: 2,
 *
 * 	// Configuration options for the table which is the frame surrounding one or more CALS tables (Required)
 * 	table: {
 * 		// The name of the containing element (Required)
 * 		localName: 'table',
 * 		// The namespace uri for the table (Optional)
 * 		namespaceURI: 'http://some-uri.com/table'
 * 	},
 *
 * 	// Configuration options for the tgroup which is table defining element (Optional)
 * 	tgroup: {
 * 		// The local name of the tgroup (Optional, defaults to "tgroup")
 * 		localName: 'tgroup',
 * 		// The namespace uri for the tgroup element and all other CALS elements unless their namespaceURIs are set (Optional)
 * 		namespaceURI: 'http://some-other-uri.com/tgroup',
 * 		// A selector which is used to filter which possible tables should be seen as cals tables for this configuration (Optional)
 * 		tableFigureFilterSelector: 'self::table and not(tgroup)'
 * 	},
 *
 * 	// Configuration options for the colspec (Optional)
 * 	colspec: {
 * 		// Custom local name for the colspec (Optional, defaults to "colspec")
 * 		localName: 'colspec',
 * 		// The namespace uri for the colspec (Optional, defaults to the tgroup element’s namespaceURI)
 * 		namespaceURI: 'http://some-other-uri.com/colspec'
 * 	},
 *
 * 	// Configuration options for the thead which is the container element of header rows (Optional)
 * 	thead: {
 * 		// Custom local name for the thead (Optional, defaults to "thead")
 * 		localName: 'thead',
 * 		// The namespace uri for the thead (Optional, defaults to the tgroup element’s namespaceURI)
 * 		namespaceURI: 'http://some-other-uri.com/thead'
 * 	},
 *
 * 	// Configuration options for the tbody which is the container element of the normal rows (Optional)
 * 	tbody: {
 * 		// Custom local name for the tbody (Optional, defaults to "tbody")
 * 		localName: 'tbody',
 * 		// The namespace uri for the tbody (Optional, defaults to the tgroup element’s namespaceURI)
 * 		namespaceURI: 'http://some-other-uri.com/tbody'
 * 	},
 *
 * 	// Configuration options for the row (Optional)
 * 	row: {
 * 		// Custom local name for the row (Optional, defaults to "row")
 * 		localName: 'row',
 * 		// The namespace uri for the row (Optional, defaults to the tgroup element’s namespaceURI)
 * 		namespaceURI: 'http://some-other-uri.com/row'
 * 	},
 *
 * 	// Configuration options for the entry (Optional)
 * 	entry: {
 * 		// Custom local name for the entry (Optional, defaults to "entry")
 * 		localName: 'entry',
 * 		// The namespace uri for the entry (Optional, defaults to the tgroup element’s namespaceURI)
 * 		namespaceURI: 'http://some-other-uri.com/entry',
 * 		// The default text container used for entry elements (Optional)
 * 		defaultTextContainer: 'p'
 * 	},
 *
 * 	// Configuration options for the frame attribute which describes position of outer rulings (Optional)
 * 	frame: {
 * 		// Custom local name for frame (Optional, defaults to "frame")
 * 		localName: 'frame',
 * 		// The all value (Optional, defaults to "all")
 * 		allValue: 'all',
 * 		// The none value (Optional, defaults to "none")
 * 		noneValue: 'none'
 * 	},
 *
 * 	// Configuration options for the cols attribute which shows number of columns in the tgroup (Optional)
 * 	cols: {
 * 		// Custom local name for cols (Optional, defaults to "cols")
 * 		localName: 'cols'
 * 	},
 *
 * 	// Configuration options for the colname attribute which is the name of the column (Optional)
 * 	colname: {
 * 		// Custom local name for colname (Optional, defaults to "colname")
 * 		localName: 'colname'
 * 	},
 *
 * 	// Configuration options for the colnum attribute which is the number of the column (Optional)
 * 	colnum: {
 * 		// Custom local name for colnum (Optional, defaults to "colnum")
 * 		localName: 'colnum'
 * 	},
 *
 * 	// Configuration options for the colwidth attribute which determines the width of the column (Optional)
 * 	colwidth: {
 * 		// Custom local name for colwidth (Optional, defaults to "colwidth")
 * 		localName: 'colwidth'
 * 	},
 *
 * 	// Configuration options for the colsep attribute which display the internal vertical column ruling at the right of the entry if other than that false value; if false value, do not display it (Optional)
 * 	colsep: {
 * 		// Custom local name for colsep (Optional, defaults to "colsep")
 * 		localName: 'colsep'
 * 	},
 *
 * 	// Configuration options for the rowsep attribute which display the internal horizontal row ruling at the bottom of the entry if other than that false value; if false value, do not display it (Optional)
 * 	rowsep: {
 * 		// Custom local name for rowsep (Optional, defaults to "rowsep")
 * 		localName: 'rowsep'
 * 	},
 *
 * 	// Configuration options for the morerows attribute which is the number of additional rows in a vertical straddle (Optional)
 * 	morerows: {
 * 		// Custom local name for morerows (Optional, defaults to "morerows")
 * 		localName: 'morerows'
 * 	},
 *
 * 	// Configuration options for the namest attribute which is the name of leftmost column of span (Optional)
 * 	namest: {
 * 		// Custom local name for namest (Optional, defaults to "namest")
 * 		localName: 'namest'
 * 	},
 *
 * 	// Configuration options for the nameend attribute which is the name of rightmost column of span (Optional)
 * 	nameend: {
 * 		// Custom local name for nameend (Optional, defaults to "nameend")
 * 		localName: 'nameend'
 * 	},
 *
 * 	// Configuration options for the align attribute which determines the text horizontal position within the entry (Optional)
 * 	align: {
 * 		// Custom local name for align (Optional, defaults to "align")
 * 		localName: 'align',
 * 		// The value for left alignment (Optional, defaults to "left")
 * 		leftValue: 'left',
 * 		// The value for right alignment (Optional, defaults to "right")
 * 		rightValue: 'right',
 * 		// The value for center alignment (Optional, defaults to "center")
 * 		centerValue: 'center',
 * 		// The value for justify alignment (Optional, defaults to "justify")
 * 		justifyValue: 'justify'
 * 	},
 *
 * 	// Configuration options for the valign attribute which determines the text vertical positioning within the entry (Optional)
 * 	valign: {
 * 		// Custom local name for valign (Optional, defaults to "valign")
 * 		localName: 'valign',
 * 		// The value for top vertical alignment (Optional, defaults to "top")
 * 		topValue: 'top',
 * 		// The value for bottom vertical alignment (Optional, defaults to "bottom")
 * 		bottomValue: 'bottom',
 * 		// The value for middle vertical alignment (Optional, defaults to "middle")
 * 		middleValue: 'middle'
 * 	},
 *
 * 	// Defines the true and false values for attributes like colsep, rowsep (Optional)
 * 	yesOrNo: {
 * 		// The value yes value (Optional, defaults to "1")
 * 		yesValue: 'yes',
 * 		// The value no value (Optional, defaults to "0")
 * 		noValue: 'no'
 * 	},
 *
 * 	// This widgets are before columns. All widgets are supported. Optional, defaults to an empty array.
 * 	columnBefore: [
 * 		createIconWidget('clock-o', {
 * 			clickOperation: 'lcTime-value-edit',
 * 			tooltipContent: 'Click here to edit the duration'
 * 		})
 * 	],
 *
 * 	// This widget is before each row. Any widget can be used, but only the {@link iconWidget} is supported here. Optional, defaults to an empty array.
 * 	rowBefore: [
 * 		createIconWidget('dot-circle-o', {
 * 			clickOperation: 'do-nothing'
 * 		})
 * 	],
 *
 * 	// This will show buttons that insert a new column or row. Optional, defaults to false.
 * 	showInsertionWidget: true,
 *
 * 	// This will show areas that can be hovered over to select a column or row and that can be clicked to show a operations popover. Optional, defaults to false.
 * 	showSelectionWidget: true
 * });
 * ```
 *
 * The cell element menu button widgets are added based on the existence of
 * {@link ContextualOperation | contextual operations} on cell level. Make sure that only cell-specific
 * operations are added to the cell widget, so that users are only given options
 * relevant to them. Example on how you can add this element menu on the widget:
 *
 * ```
 * configureProperties(sxModule, 'self::entry', {
 * 	contextualOperations: [
 * 		{ name: 'contextual-set-total-cell', hideIn: ['context-menu'] }
 * 	]
 * });
 * ```
 *
 * Cals tables can also be configured to be collapsible. Refer to {@link
 * fonto-documentation/docs/configure/elements/configure-tables.xml#id-6c3f43af-b40c-4fa3-ab47-f0fd2d4ab85c
 * | our guide} to learn more.
 *
 * @fontosdk importable
 */
export default function configureAsCalsTableElements(
	sxModule: SxModule,
	options: TableElementsCalsOptions & TableElementsSharedOptions
): void {
	const tableDefinition = new CalsTableDefinition(options);
	configureAsTableElements(
		sxModule,
		{
			...options,
			cell:
				options.entry && 'defaultTextContainer' in options.entry
					? {
							defaultTextContainer:
								options.entry.defaultTextContainer,
					  }
					: {},
		},
		tableDefinition
	);
}
