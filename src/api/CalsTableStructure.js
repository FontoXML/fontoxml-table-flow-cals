define(
	[
		'fontoxml-table-flow',

		'./buildGridModel',

		'./createDefaultCellSpec',
		'./createDefaultColSpec',
		'./createDefaultRowSpec',

		'./tableGridModelToCalsTable'
	],
	function (
		tableFlow,

		buildGridModel,

		createDefaultCellSpec,
		createDefaultColSpec,
		createDefaultRowSpec,

		tableGridModelToCalsTable
		) {
		'use strict';

		var TableStructure = tableFlow.TableStructure,
			createNewTableCreater = tableFlow.createNewTableCreater;

		/**
		 * The Cals table structure defines the translation between cals tables and the generic table model.
		 *   The translation is done in buildGridModel().
		 */
		function CalsTableStructure () {
			this.tableDefiningElements = ['tgroup'];

			this.tableCellElements = ['entry'];

			this.tablePartElements = ['colspec', 'thead', 'tbody', 'row', 'entry'];
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
			return this.tableDefiningElements.indexOf(element.nodeName) !== -1;
		};

		/**
		 * Returns whether the given node is the element defining a table cell in the CALS definition
		 *
		 * @param   {Node}     element The node to check
		 *
		 * @return  {Boolean}  Whether the node is a tablecell element
		 */
		CalsTableStructure.prototype.isTableCell = function (element) {
			return this.tableCellElements.indexOf(element.nodeName) !== -1;
		};

		/**
		 * Returns whether the given node is part of a table in the CALS definition
		 *
		 * @param   {Node}     element The node to check
		 *
		 * @return  {Boolean}  Whether the node is part of a table
		 */
		CalsTableStructure.prototype.isTablePart = function (element) {
			return this.tablePartElements.indexOf(element.nodeName) !== -1;
		};

		CalsTableStructure.prototype.buildGridModel = function (element) {
			return buildGridModel(element, this);
		};

		/**
		 * Attempt to synchronize the xml with the tablegridmodel under the given tgroupnode.
		 *
		 * @param   {TableGridModel}  tableGridModel  The tableGridModel to serialize
		 * @param   {Node}            tgroupNode      The TGroupNode to serialize the table under
		 * @param   {Blueprint}       blueprint       The blueprint to serialize in
		 * @param   {Format}          format          The format containing the validator and metadata to use
		 * @return  {boolean}         The success of the serialization. If true, the serialization took place in the given blueprint
		 */
		CalsTableStructure.prototype.applyToDom = function (tableGridModel, tgroupNode, blueprint, format) {
			return tableGridModelToCalsTable(tableGridModel, tgroupNode, blueprint, format);
		};

		CalsTableStructure.prototype.getNewTableCreater = function () {
			return createNewTableCreater(
				'entry',
				createDefaultRowSpec,
				createDefaultColSpec,
				createDefaultCellSpec,
				this);
		};

		CalsTableStructure.prototype.getTableDefiningNode = function (targetNode) {
			if (targetNode.nodeName !== 'entry') {
				return false;
			}

			//                        ENTRY       ROW    THEAD/TBODY   TGROUP
			var tableDefiningNode = targetNode.parentNode.parentNode.parentNode;
			return tableDefiningNode;
		};

		var calsTableStructure = new CalsTableStructure();

		return calsTableStructure;
	}
);
