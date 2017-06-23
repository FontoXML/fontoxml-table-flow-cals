FontoXML/table-flow-cals
------------------------
Provides a CALS-specific implementation of the generic table-flow package.

This packages exposes a single configureAsCalsTableElements function for configuring CALS table elements.

---

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
		namespaceUri: 'http://some-uri.com/'
		// Family visualization options (optional)
		visualization: {}
	},

	tgroup: {
		// The namespace uri for the tgoup element and its descendant elements (optional)
		namespaceUri: 'http://some-other-uri.com/'
		// Family visualization options (optional)
		visualization: {}
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
	}
});
```

To configure the markup labels and contextual operations, use the `configureMarkupLabel` and `configureContextualOperations` functions.
