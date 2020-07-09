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

	// Widget area before columns. Any widget can be used, but only the {@link iconWidget} is supported here. Optional, defaults to an empty array.
	columnBefore: [
		createIconWidget('clock-o', {
			clickOperation: 'lcTime-value-edit',
			tooltipContent: 'Click here to edit the duration'
		})
	],

	// Widget are before rows. Any widget can be used, but only the {@link iconWidget} is supported here. Optional, defaults to an empty array.
	rowBefore: [
		createIconWidget('dot-circle-o', {
			clickOperation: 'do-nothing'
		})
	],

	// This will show buttons that insert a new column or row. Optional, defaults to false.
	showInsertionWidget: true,

	// This will show areas that can be hovered over to hightlight a column or row and that can be clicked to show a operations popover. Optional, defaults to false.
	showHighlightingWidget: true
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

	// Widget area before columns. Any widget can be used, but only the {@link iconWidget} is supported here. Optional, defaults to an empty array.
	columnBefore: [
		createIconWidget('clock-o', {
			clickOperation: 'lcTime-value-edit',
			tooltipContent: 'Click here to edit the duration'
		})
	],

	// Widget are before rows. Any widget can be used, but only the {@link iconWidget} is supported here. Optional, defaults to an empty array.
	rowBefore: [
		createIconWidget('dot-circle-o', {
			clickOperation: 'do-nothing'
		})
	],

	// This will show buttons that insert a new column or row. Optional, defaults to false.
	showInsertionWidget: true,

	// This will show areas that can be hovered over to hightlight a column or row and that can be clicked to show a operations popover. Optional, defaults to false.
	showHighlightingWidget: true
});
```

**Note** that this add-on supports existing tables that contain `tfoot` elements. However, it _does not_ support inserting these elements in new tables.

To configure the markup labels and contextual operations, use the {@link configureProperties} function.
