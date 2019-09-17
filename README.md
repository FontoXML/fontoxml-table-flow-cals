---
category: add-on/fontoxml-table-flow-cals
---

# CALS table support

Provide support for CALS compatible tables.

This packages exposes a single configureAsCalsTableElements function for configuring CALS table elements.

Use the configureAsCalsTableElements like this:

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
		// The namespace uri for the tgoup element and its descendant elements (optional)
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

	// Use createIconWidget to add column icons before rows or columns. Any widget can be added but only icon widget is supported.
	columnBefore: [
		createIconWidget('clock-o', {
			clickOperation: 'lcTime-value-edit',
			tooltipContent: 'Click here to edit the duration'
		})
	],

	rowBefore: [
		createIconWidget('dot-circle-o', {
			clickOperation: 'do-nothing'
		})
	],

	// To add insertion buttons which insert a column or a row at a specific place, default false.
	showInsertionWidget: true,

	// To add highlighting bars which highlight columns and rows, and provide operations popover, default false.
	showHighlightingWidget: true
});
```

To configure the markup labels and contextual operations, use the {@link configureProperties} function.
