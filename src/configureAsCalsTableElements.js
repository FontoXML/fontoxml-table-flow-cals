define([
	'fontoxml-families/configureAsFrame',
	'fontoxml-families/configureAsFrameWithBlock',
	'fontoxml-families/configureAsRemoved',
	'fontoxml-families/configureAsStructure',
	'fontoxml-families/configureAsTable',
	'fontoxml-table-flow/TableValidator',
	'fontoxml-table-flow/tableStructureManager',

	'./tableStructure/CalsTableStructure',
	'./templates/EntryTemplate',
	'./templates/TgroupTemplate'
], function (
	configureAsFrame,
	configureAsFrameWithBlock,
	configureAsRemoved,
	configureAsStructure,
	configureAsTable,
	TableValidator,
	tableStructureManager,

	CalsTableStructure,
	EntryTemplate,
	TgroupTemplate
) {
	'use strict';

	/**
	 * Configure the cals table implementation
	 *
	 * @fontosdk
	 *
	 * @category add-on/fontoxml-table-flow-cals
	 *
	 * @param  {Object}   sxModule
	 * @param  {Object}   options
	 * @param  {number}   [options.priority]                    Selector priority for all elements configured by this function
	 * @param  {Object}   [options.yesOrNo]                     Defines the true and false values for attributes like colsep
	 * @param  {string}   [options.yesOrNo.yesValue='1']        The true value
	 * @param  {string}   [options.yesOrNo.noValue='0']         The false value
	 * @param  {Object}   options.table                         Configuration options for the table element
	 * @param  {string}   options.table.localName               The local name of the table element
	 * @param  {string}   [options.table.namespaceURI]          The namespace URI unique to the table element
	 * @param  {Object}   [options.tgroup]                      Configuration options for the tgroup element
	 * @param  {string}   [options.tgroup.namespaceURI]         The namespace URI for the tgroup element and its child elements
	 * @param  {Object}   [options.entry]                       Configuration options for the entry element
	 * @param  {string}   [options.entry.defaultTextContainer]  The default text container for the entry element
	 * @param  {Object}   [options.thead]                       Configuration options for the thead element
	 * @param  {string}   [options.thead.localName='thead']     The local name for the thead element
	 * @param  {Object}   [options.tfoot]                       Configuration options for the tfoor element
	 * @param  {string}   [options.tfoot.localName='tfoot']     The local name for the tfoor element
	 */
	return function configureAsCalsTableElements (sxModule, options) {
		options = options || {};
		var tableStructure = new CalsTableStructure(options);
		tableStructureManager.addTableStructure(tableStructure);

		sxModule.configure('format')
			.addRestrictingValidator(new TableValidator(tableStructure));

		var priority = options.priority;

		// Table figure (table)
		var tableSelector = 'self::' + tableStructure.selectorParts.table;
		configureAsFrame(sxModule, tableSelector, undefined, {
			priority: priority,
			tabNavigationSelector: 'self::' + tableStructure.selectorParts.cell
		});

		// Table (tgroup)
		var tgroupSelector = 'self::' + tableStructure.selectorParts.tgroup;
		configureAsTable(sxModule, tgroupSelector, undefined, {
			isRemovableIfEmpty: false,
			priority: priority
		});

		sxModule.configure('fontoxml-templated-views').stylesheet('content')
			.renderNodesMatching(tgroupSelector, priority)
				.withTemplate(new TgroupTemplate());

		// Column (colspec)
		var colspecSelector = 'self::' + tableStructure.selectorParts.colspec;
		configureAsRemoved(sxModule, colspecSelector, undefined);

		// Row (row)
		var rowSelector = 'self::' + tableStructure.selectorParts.row;
		configureAsStructure(sxModule, rowSelector, undefined, {
			isRemovableIfEmpty: false,
			priority: priority
		});

		sxModule.configure('fontoxml-templated-views').stylesheet('content')
			.renderNodesMatching(rowSelector, priority)
				.asSingleElement('tr');

		// Cell (entry)
		var entrySelector = 'self::' + tableStructure.selectorParts.entry;
		configureAsFrameWithBlock(sxModule, entrySelector, undefined, {
			defaultTextContainer: options.entry && options.entry.defaultTextContainer ?
				options.entry.defaultTextContainer :
				null,
			isRemovableIfEmpty: false,
			priority: priority
		});

		sxModule.configure('fontoxml-templated-views').stylesheet('content')
			.renderNodesMatching(entrySelector, priority)
				.withTemplate(new EntryTemplate());

		// Header (thead)
		var theadSelector = 'self::' + tableStructure.selectorParts.thead;
		configureAsStructure(sxModule, theadSelector, undefined, {
			isRemovableIfEmpty: false,
			priority: priority
		});

		sxModule.configure('fontoxml-templated-views').stylesheet('content')
			.renderNodesMatching(theadSelector, priority)
				.asSingleElement('thead');

		// Body (tbody)
		var tbodySelector = 'self::' + tableStructure.selectorParts.tbody;
		configureAsStructure(sxModule, tbodySelector, undefined, {
			isRemovableIfEmpty: false,
			priority: priority
		});

		sxModule.configure('fontoxml-templated-views').stylesheet('content')
			.renderNodesMatching(tbodySelector, priority)
				.asSingleElement('tbody');

		// Footer (tfoot)
		var tfootSelector = 'self::' + tableStructure.selectorParts.tfoot;
		configureAsStructure(sxModule, tfootSelector, undefined, {
			isRemovableIfEmpty: false,
			priority: priority
		});

		sxModule.configure('fontoxml-templated-views').stylesheet('content')
			.renderNodesMatching(tfootSelector, priority)
				.asSingleElement('tfoot');
	};
});
