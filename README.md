---
category: add-on/fontoxml-table-flow-cals
---

# CALS table support

This add-on adds support for CALS tables to a Fonto editor.

This add-on exposes one function called {@link configureAsCalsTableElements}. This function configures all CALS table elements. This eliminates the need for configuring any of the CALS table elements separately.

The `configureAsCalsTableElements` function should be used in a configureSxModule file, like this:

```
configureAsCalsTableElements(sxModule, {
	// Priority of the selectors used to select the table elements (optional)
	priority: 2,

	// Values to be used for boolean attribute values (optional)
	yesOrNo: {
		yesValue: 'yes', // Defaults to '1'
		noValue: 'no'    // Defaults to '0'
	},

	table: {
		// The name of the containing element
		localName: 'table',
		// The uri for the table element (optional)
		namespaceURI: 'http://some-uri.com/'
	},

	tgroup: {
		// The namespace uri for the tgoup element and all other CALS elements (optional)
		namespaceURI: 'http://some-other-uri.com/'
	},

	entry: {
		// The default text container used for entry elements (optional)
		defaultTextContainer: 'p'
	},

	thead: {
		// Custom local name for thead (optional)
		localName: 'customHead'
	},

	// This widgets are before columns. All widgets are supported. Optional, defaults to an empty array.
	columnBefore: [
		createIconWidget('clock-o', {
			clickOperation: 'lcTime-value-edit',
			tooltipContent: 'Click here to edit the duration'
		})
	],

	// This widget is before each row. Any widget can be used, but only the {@link iconWidget} is supported here. Optional, defaults to an empty array.
	rowBefore: [
		createIconWidget('dot-circle-o', {
			clickOperation: 'do-nothing'
		})
	],

	// This will show buttons that insert a new column or row. Optional, defaults to false.
	showInsertionWidget: true,

	// This will show areas that can be hovered over to hightlight a column or row and that can be clicked to show a operations popover. Optional, defaults to false.
	showHighlightingWidget: true,

	// This XPath expression determines whether or not a table has the ability to be collapsed. Optional, defaults to 'false()'.
	// $rowCount and $columnCount helper variables can also optionally be used in the XPath expression to make it easier to configure
	// when the table should collapse i.e. '$rowCount > 5' which will allow tables with rows more than 5 to be able to be collapsed/uncollapsed
	isCollapsibleQuery: 'false()'

	// This XPath expression determines whether a table that has the ability to be collapsed should start off as collapsed on initial load. Optional, defaults to 'true()'.
	// $rowCount and $columnCount helper variables can also optionally be used in the XPath expression to make it easier to configure
	// when the table should start off as collapsed i.e. '$rowCount > 10' means that tables that have more than 10 rows will initially start off as collapsed
	// Note: This query is only evaluated on tables which have the ability to be collapsed using isCollapsibleQuery
	isInitiallyCollapsedQuery: 'true()'

	// In CALS table, there are some operations in the column/row widget menus as default. But they can be overridden.
 	columnWidgetMenuOperations: [
		{
			contents: [
				{ name: 'contextual-cals-set-cell-horizontal-alignment-left' },
				{ name: 'contextual-cals-set-cell-horizontal-alignment-center' },
				{ name: 'contextual-cals-set-cell-horizontal-alignment-right' },
				{ name: 'contextual-cals-set-cell-horizontal-alignment-justify' }
			]
		},
		{
			contents: [
				{ name: 'contextual-cals-set-cell-vertical-alignment-top' },
				{ name: 'contextual-cals-set-cell-vertical-alignment-center' },
				{ name: 'contextual-cals-set-cell-vertical-alignment-bottom' }
			]
		},
		{ contents: [{ name: 'contextual-cals-toggle-cell-border-all' }] },
		{ contents: [{ name: 'column-delete-at-index' }] }
	],
 	rowWidgetMenuOperations: [
		{
			contents: [
				{ name: 'contextual-cals-set-cell-horizontal-alignment-left' },
				{ name: 'contextual-cals-set-cell-horizontal-alignment-center' },
				{ name: 'contextual-cals-set-cell-horizontal-alignment-right' },
				{ name: 'contextual-cals-set-cell-horizontal-alignment-justify' }
			]
		},
		{
			contents: [
				{ name: 'contextual-cals-set-cell-vertical-alignment-top' },
				{ name: 'contextual-cals-set-cell-vertical-alignment-center' },
				{ name: 'contextual-cals-set-cell-vertical-alignment-bottom' }
			]
		},
		{ contents: [{ name: 'contextual-cals-toggle-cell-border-all' }] },
		{ contents: [{ name: 'contextual-row-delete' }] }
	]
});
```

It is also possible to configure all element names and attributes, and attribute names and possible
values.

```
configureAsCalsTableElements(sxModule, {
	// Priority of the selectors used to select the table elements (Optional)
	priority: 2,

	// Configuration options for the table which is the frame surrounding one or more CALS tables (Required)
	table: {
		// The name of the containing element (Required)
		localName: 'table',
		// The namespace uri for the table (Optional)
		namespaceURI: 'http://some-uri.com/table'
	},

	// Configuration options for the tgroup which is table defining element (Optional)
	tgroup: {
		// The local name of the tgroup (Optional, defaults to "tgroup")
		localName: 'tgroup',
		// The namespace uri for the tgroup element and all other CALS elements unless their namespaceURIs are set (Optional)
		namespaceURI: 'http://some-other-uri.com/tgroup',
		// A selector which is used to filter which possible tables should be seen as cals tables for this configuration (Optional)
		tableFigureFilterSelector: 'self::table and not(tgroup)'
	},

	// Configuration options for the colspec (Optional)
	colspec: {
		// Custom local name for the colspec (Optional, defaults to "colspec")
		localName: 'colspec',
		// The namespace uri for the colspec (Optional, defaults to the tgroup element’s namespaceURI)
		namespaceURI: 'http://some-other-uri.com/colspec'
	},

	// Configuration options for the thead which is the container element of header rows (Optional)
	thead: {
		// Custom local name for the thead (Optional, defaults to "thead")
		localName: 'thead',
		// The namespace uri for the thead (Optional, defaults to the tgroup element’s namespaceURI)
		namespaceURI: 'http://some-other-uri.com/thead'
	},

	// Configuration options for the tbody which is the container element of the normal rows (Optional)
	tbody: {
		// Custom local name for the tbody (Optional, defaults to "tbody")
		localName: 'tbody',
		// The namespace uri for the tbody (Optional, defaults to the tgroup element’s namespaceURI)
		namespaceURI: 'http://some-other-uri.com/tbody'
	},

	// Configuration options for the row (Optional)
	row: {
		// Custom local name for the row (Optional, defaults to "row")
		localName: 'row',
		// The namespace uri for the row (Optional, defaults to the tgroup element’s namespaceURI)
		namespaceURI: 'http://some-other-uri.com/row'
	},

	// Configuration options for the entry (Optional)
	entry: {
		// Custom local name for the entry (Optional, defaults to "entry")
		localName: 'entry',
		// The namespace uri for the entry (Optional, defaults to the tgroup element’s namespaceURI)
		namespaceURI: 'http://some-other-uri.com/entry',
		// The default text container used for entry elements (Optional)
		defaultTextContainer: 'p'
	},

	// Configuration options for the frame attribute which describes position of outer rulings (Optional)
	frame: {
		// Custom local name for frame (Optional, defaults to "frame")
		localName: 'frame',
		// The all value (Optional, defaults to "all")
		allValue: 'all',
		// The none value (Optional, defaults to "none")
		noneValue: 'none'
	},

	// Configuration options for the cols attribute which shows number of columns in the tgroup (Optional)
	cols: {
		// Custom local name for cols (Optional, defaults to "cols")
		localName: 'cols'
	},

	// Configuration options for the colname attribute which is the name of the column (Optional)
	colname: {
		// Custom local name for colname (Optional, defaults to "colname")
		localName: 'colname'
	},

	// Configuration options for the colnum attribute which is the number of the column (Optional)
	colnum: {
		// Custom local name for colnum (Optional, defaults to "colnum")
		localName: 'colnum'
	},

	// Configuration options for the colwidth attribute which determines the width of the column (Optional)
	colwidth: {
		// Custom local name for colwidth (Optional, defaults to "colwidth")
		localName: 'colwidth'
	},

    // Configuration options for the colsep attribute which display the internal vertical column ruling at the right of the entry if other than that false value; if false value, do not display it (Optional)
	colsep: {
		// Custom local name for colsep (Optional, defaults to "colsep")
		localName: 'colsep'
	},

    // Configuration options for the rowsep attribute which display the internal horizontal row ruling at the bottom of the entry if other than that false value; if false value, do not display it (Optional)
	rowsep: {
		// Custom local name for rowsep (Optional, defaults to "rowsep")
		localName: 'rowsep'
	},

    // Configuration options for the morerows attribute which is the number of additional rows in a vertical straddle (Optional)
	morerows: {
		// Custom local name for morerows (Optional, defaults to "morerows")
		localName: 'morerows'
	},

	// Configuration options for the namest attribute which is the name of leftmost column of span (Optional)
	namest: {
		// Custom local name for namest (Optional, defaults to "namest")
		localName: 'namest'
	},

    // Configuration options for the nameend attribute which is the name of rightmost column of span (Optional)
	nameend: {
		// Custom local name for nameend (Optional, defaults to "nameend")
		localName: 'nameend'
	},

    // Configuration options for the align attribute which determines the text horizontal position within the entry (Optional)
	align: {
		// Custom local name for align (Optional, defaults to "align")
		localName: 'align',
		// The value for left alignment (Optional, defaults to "left")
		leftValue: 'left',
		// The value for right alignment (Optional, defaults to "right")
		rightValue: 'right',
		// The value for center alignment (Optional, defaults to "center")
		centerValue: 'center',
		// The value for justify alignment (Optional, defaults to "justify")
		justifyValue: 'justify'
	},

    // Configuration options for the valign attribute which determines the text vertical positioning within the entry (Optional)
	valign: {
		// Custom local name for valign (Optional, defaults to "valign")
		localName: 'valign',
		// The value for top vertical alignment (Optional, defaults to "top")
		topValue: 'top',
		// The value for bottom vertical alignment (Optional, defaults to "bottom")
		bottomValue: 'bottom',
		// The value for middle vertical alignment (Optional, defaults to "middle")
		middleValue: 'middle'
	},

	// Defines the true and false values for attributes like colsep, rowsep (Optional)
	yesOrNo: {
		// The value yes value (Optional, defaults to "1")
		yesValue: 'yes',
		// The value no value (Optional, defaults to "0")
		noValue: 'no'
	},

	// This widgets are before columns. All widgets are supported. Optional, defaults to an empty array.
	columnBefore: [
		createIconWidget('clock-o', {
			clickOperation: 'lcTime-value-edit',
			tooltipContent: 'Click here to edit the duration'
		})
	],

	// This widget is before each row. Any widget can be used, but only the {@link iconWidget} is supported here. Optional, defaults to an empty array.
	rowBefore: [
		createIconWidget('dot-circle-o', {
			clickOperation: 'do-nothing'
		})
	],

	// This will show buttons that insert a new column or row. Optional, defaults to false.
	showInsertionWidget: true,

	// This will show areas that can be hovered over to hightlight a column or row and that can be clicked to show a operations popover. Optional, defaults to false.
	showHighlightingWidget: true,

	// This XPath expression determines whether or not a table has the ability to be collapsed. Optional, defaults to 'false()'.
	// $rowCount and $columnCount helper variables can also optionally be used in the XPath expression to make it easier to configure
	// when the table should collapse i.e. '$rowCount > 5' which will allow tables with rows more than 5 to be able to be collapsed/uncollapsed
	isCollapsibleQuery: 'false()'

	// This XPath expression determines whether a table that has the ability to be collapsed should start off as collapsed on initial load. Optional, defaults to 'true()'.
	// $rowCount and $columnCount helper variables can also optionally be used in the XPath expression to make it easier to configure
	// when the table should start off as collapsed i.e. '$rowCount > 10' means that tables that have more than 10 rows will initially start off as collapsed
	// Note: This query is only evaluated on tables which have the ability to be collapsed using isCollapsibleQuery
	isInitiallyCollapsedQuery: 'true()'

	// In CALS table, there are some operations in the column/row widget menus as default. But they can be overridden.
 	columnWidgetMenuOperations: [
		 {
			contents: [
				{ name: 'contextual-cals-set-cell-horizontal-alignment-left' },
				{ name: 'contextual-cals-set-cell-horizontal-alignment-center' },
				{ name: 'contextual-cals-set-cell-horizontal-alignment-right' },
				{ name: 'contextual-cals-set-cell-horizontal-alignment-justify' }
			]
		},
		{
			contents: [
				{ name: 'contextual-cals-set-cell-vertical-alignment-top' },
				{ name: 'contextual-cals-set-cell-vertical-alignment-center' },
				{ name: 'contextual-cals-set-cell-vertical-alignment-bottom' }
			]
		},
		{ contents: [{ name: 'contextual-cals-toggle-cell-border-all' }] },
		{ contents: [{ name: 'column-delete-at-index' }] }
	],
 	rowWidgetMenuOperations:  [
		{
			contents: [
				{ name: 'contextual-cals-set-cell-horizontal-alignment-left' },
				{ name: 'contextual-cals-set-cell-horizontal-alignment-center' },
				{ name: 'contextual-cals-set-cell-horizontal-alignment-right' },
				{ name: 'contextual-cals-set-cell-horizontal-alignment-justify' }
			]
		},
		{
			contents: [
				{ name: 'contextual-cals-set-cell-vertical-alignment-top' },
				{ name: 'contextual-cals-set-cell-vertical-alignment-center' },
				{ name: 'contextual-cals-set-cell-vertical-alignment-bottom' }
			]
		},
		{ contents: [{ name: 'contextual-cals-toggle-cell-border-all' }] },
		{ contents: [{ name: 'contextual-row-delete' }] }
	]
});
```

**Note** that this add-on supports existing tables that contain `tfoot` elements. However, it _does not_ support inserting these elements in new tables.

To configure the markup labels and contextual operations, use the {@link configureProperties} function.

The cell element menu button widgets are added based on the existence of contextual operations on cell level. Make sure that only cell-specific operations are added to the cell widget, so that users are only given options relevant to them.
Example on how you can add this element menu on the widget:

```
configureProperties(sxModule, 'self::entry', {
	contextualOperations: [
		{ name: 'contextual-set-total-cell', hideIn: ['context-menu'] }
	]
});
```

# Contributing

This package can serve as a base for custom versions of CALS tables. It can be forked by checking
it out directly in the `packages` folder of an editor. When making a fork, consider keeping it
up-to-date with new Fonto Editor versions when they release. Please refer to [our documentation on
open-source add-ons](https://documentation.fontoxml.com/latest/add-ons-03165378ea7b#id-2cd061ac-8db3-1afa-57db-c07876d3bd11)
for possible approaches to maintaining and integrating (forks of) this add-on.

The code in this package is complex and is continously optimized for performance. We would like to
maintain any changes and extensions that you make to this package. We highly appreciate pull
requests for bug fixes, changes, or extensions to this package, as long as they are stable enough
and they are in line with the CALS standard.
