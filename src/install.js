import addCustomMutation from 'fontoxml-base-flow/src/addCustomMutation.js';
import readOnlyBlueprint from 'fontoxml-blueprints/src/readOnlyBlueprint.js';
import documentsManager from 'fontoxml-documents/src/documentsManager.js';
import namespaceManager from 'fontoxml-dom-namespaces/src/namespaceManager.js';
import addTransform from 'fontoxml-operations/src/addTransform.js';
import operationsManager from 'fontoxml-operations/src/operationsManager.js';
import evaluateXPathToBoolean from 'fontoxml-selectors/src/evaluateXPathToBoolean.js';
import registerCustomXPathFunction from 'fontoxml-selectors/src/registerCustomXPathFunction.js';
import tableDefinitionManager from 'fontoxml-table-flow/src/tableDefinitionManager.js';

import toggleCellBorder from './custom-mutations/toggleCellBorder.js';
import CalsTableDefinition from './table-definition/CalsTableDefinition.js';

const FONTO_FUNCTIONS = namespaceManager.getNamespaceUri(null, 'fonto');

export default function install() {
	addCustomMutation('calsToggleCellBorder', toggleCellBorder);

	/**
	 * Returns whether the given node is a cals table node. This will return true for both table
	 * figure node (table) and table defining node (tgroup). If null or nothing is passed, the
	 * function will return false.
	 *
	 * @name fonto:is-cals-table
	 *
	 * @category xpath
	 *
	 * @param  {node()}  [node]
	 *
	 * @return {xs:boolean}  Whether the passed node is a cals table.
	 */
	registerCustomXPathFunction(
		{ namespaceURI: FONTO_FUNCTIONS, localName: 'is-cals-table' },
		['node()?'],
		'xs:boolean',
		(dynamicContext, node) => {
			if (!node) {
				return false;
			}

			const tableDefinition = tableDefinitionManager.getTableDefinitionForNode(
				node,
				dynamicContext.domFacade
			);

			return !!(
				tableDefinition &&
				tableDefinition instanceof CalsTableDefinition &&
				tableDefinition.isTable(node, dynamicContext.domFacade)
			);
		}
	);

	operationsManager.addAlternativeOperation('set-cell-border-none', 'cals-set-cell-border-none');
	operationsManager.addAlternativeOperation('set-cell-border-all', 'cals-set-cell-border-all');

	operationsManager.addAlternativeOperation(
		'set-cell-horizontal-alignment-left',
		'cals-set-cell-horizontal-alignment-left'
	);
	operationsManager.addAlternativeOperation(
		'set-cell-horizontal-alignment-right',
		'cals-set-cell-horizontal-alignment-right'
	);
	operationsManager.addAlternativeOperation(
		'set-cell-horizontal-alignment-center',
		'cals-set-cell-horizontal-alignment-center'
	);
	operationsManager.addAlternativeOperation(
		'set-cell-horizontal-alignment-justify',
		'cals-set-cell-horizontal-alignment-justify'
	);
	operationsManager.addAlternativeOperation(
		'set-cell-vertical-alignment-top',
		'cals-set-cell-vertical-alignment-top'
	);
	operationsManager.addAlternativeOperation(
		'set-cell-vertical-alignment-bottom',
		'cals-set-cell-vertical-alignment-bottom'
	);
	operationsManager.addAlternativeOperation(
		'set-cell-vertical-alignment-middle',
		'cals-set-cell-vertical-alignment-center'
	);

	addTransform('checkCalsTableCell', function(stepData) {
		// Whilst we pass all cellNodeIds as parameter, we are only going to use the first one,
		// because we only need one cell to do the check.
		const cellNode =
			stepData.cellNodeIds &&
			stepData.cellNodeIds.length &&
			documentsManager.getNodeById(stepData.cellNodeIds[0]);

		if (
			!(
				cellNode &&
				// ancestors: row, tbody/thead, tgroup
				evaluateXPathToBoolean(
					'ancestor::*[3][fonto:is-cals-table(.)]',
					cellNode,
					readOnlyBlueprint
				)
			)
		) {
			// If there is no node or the node is not a cals table cell,
			// disable the operation.
			stepData.operationState = { enabled: false, active: false };
		}

		return stepData;
	});
}
