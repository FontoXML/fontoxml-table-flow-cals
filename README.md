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

	tfoot: {
		// Custom local name for tfoot (optional)
		localName: 'customFoot'
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
