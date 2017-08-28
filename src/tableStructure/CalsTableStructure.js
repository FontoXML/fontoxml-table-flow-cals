define([
	'fontoxml-blueprints/readOnlyBlueprint',
	'fontoxml-dom-namespaces/namespaceManager',
	'fontoxml-selectors/evaluateXPathToBoolean',
	'fontoxml-selectors/evaluateXPathToFirstNode',
	'fontoxml-table-flow',

	'./buildGridModel',
	'./tableGridModelToCalsTable',
	'./specs/createDefaultCellSpec',
	'./specs/createDefaultColSpec',
	'./specs/createDefaultRowSpec'
], function (
	readOnlyBlueprint,
	namespaceManager,
	evaluateXPathToBoolean,
	evaluateXPathToFirstNode,
	tableFlow,

	buildGridModel,
	tableGridModelToCalsTable,
	createDefaultCellSpec,
	createDefaultColSpec,
	createDefaultRowSpec
) {
	'use strict';

	var TableStructure = tableFlow.TableStructure,
		createNewTableCreator = tableFlow.primitives.createNewTableCreater;

	/**
	 * The Cals table structure defines the translation between cals tables and the generic table model.
	 *   The translation is done in buildGridModel().
	 *
	 * @param  {Object}  options
	 */
	function CalsTableStructure (options) {
		// Configurable element names
		this.tableFigureLocalName = options.table.localName;
		this.headLocalName = options.thead && options.thead.localName ? options.thead.localName : 'thead';
		this.footLocalName = options.tfoot && options.tfoot.localName ? options.tfoot.localName : 'tfoot';

		// Configurable namespace URIs
		this.tableNamespaceUri = options.table.namespaceUri || '';
		this.namespaceUri = options.tgroup.namespaceUri || '';

		this.yesValue = (options.yesOrNo && options.yesOrNo.yesValue) ? options.yesOrNo.yesValue : '1';
		this.noValue = (options.yesOrNo && options.yesOrNo.noValue) ? options.yesOrNo.noValue : '0';

		var defaultNamespaceSelector = 'Q{' + this.namespaceUri + '}';
		this.selectorParts = {
			table: 'Q{' + this.tableNamespaceUri + '}' + this.tableFigureLocalName,
			tgroup: defaultNamespaceSelector + 'tgroup',
			thead: defaultNamespaceSelector + this.headLocalName,
			tbody: defaultNamespaceSelector + 'tbody',
			tfoot: defaultNamespaceSelector + this.footLocalName,
			row: defaultNamespaceSelector + 'row',
			entry: defaultNamespaceSelector + 'entry',
			colspec: defaultNamespaceSelector + 'colspec'
		};

		this._tablePartsSelector = Object.keys(this.selectorParts).map(function (key) {
			return 'self::' + this.selectorParts[key];
		}.bind(this)).join(' or ');

		this.tableDefiningNodeSelector = this.selectorParts.table;
	}

	CalsTableStructure.prototype = TableStructure;
	CalsTableStructure.prototype.constructor = CalsTableStructure;

	/**
	 * returns whether the given node is a table node, in the CALS definition
	 *
	 * @param   {Node}     element  The node to check
	 *
	 * @return  {boolean}  Whether the node is a table root node
	 */
	CalsTableStructure.prototype.isTable = function (element) {
		return evaluateXPathToBoolean('self::' + this.selectorParts.table, element, readOnlyBlueprint);
	};

	/**
	 * Returns whether the given node is the element defining a table cell in the CALS definition
	 *
	 * @param   {Node}     element The node to check
	 *
	 * @return  {boolean}  Whether the node is a tablecell element
	 */
	CalsTableStructure.prototype.isTableCell = function (element) {
		return evaluateXPathToBoolean('self::' + this.selectorParts.entry, element, readOnlyBlueprint);
	};

	/**
	 * Returns whether the given node is part of a table in the CALS definition
	 *
	 * @param   {Node}     element The node to check
	 *
	 * @return  {boolean}  Whether the node is part of a table
	 */
	CalsTableStructure.prototype.isTablePart = function (element) {
		return evaluateXPathToBoolean(this._tablePartsSelector, element, readOnlyBlueprint);
	};

	CalsTableStructure.prototype.buildGridModel = function (element, blueprint) {
		var tableElement = evaluateXPathToFirstNode('descendant-or-self::' + this.selectorParts.tgroup, element, blueprint);
		return buildGridModel(this, tableElement, blueprint);
	};

	/**
	 * Attempt to synchronize the xml with the tablegridmodel under the given tgroupnode.
	 *
	 * @param   {TableGridModel}  tableGridModel  The tableGridModel to serialize
	 * @param   {Node}            tableNode       The tableNode to serialize the table under
	 * @param   {Blueprint}       blueprint       The blueprint to serialize in
	 * @param   {Format}          format          The format containing the validator and metadata to use
	 * @return  {boolean}         The success of the serialization. If true, the serialization took place in the given blueprint
	 */
	CalsTableStructure.prototype.applyToDom = function (tableGridModel, tableNode, blueprint, format) {
		var actualTableNode = evaluateXPathToFirstNode('descendant-or-self::' + this.selectorParts.tgroup, tableNode, blueprint);
		return tableGridModelToCalsTable(this, tableGridModel, actualTableNode, blueprint, format);
	};

	CalsTableStructure.prototype.getNewTableCreater = function () {
		return createNewTableCreator(
			'entry',
			createDefaultRowSpec,
			createDefaultColSpec,
			createDefaultCellSpec,
			this);
	};

	CalsTableStructure.prototype.createTableBase = function (ownerDocument) {
		var tableNode = namespaceManager.createElementNS(ownerDocument, this.tableNamespaceUri, this.tableFigureLocalName),
			tgroupNode = namespaceManager.createElementNS(ownerDocument, this.namespaceUri, 'tgroup'),
			tbodyNode = namespaceManager.createElementNS(ownerDocument, this.namespaceUri, 'tbody');

		tgroupNode.appendChild(tbodyNode);
		tableNode.appendChild(tgroupNode);

		return tableNode;
	};

	return CalsTableStructure;
});
