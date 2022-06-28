import addCustomMutation from 'fontoxml-base-flow/src/addCustomMutation';
import readOnlyBlueprint from 'fontoxml-blueprints/src/readOnlyBlueprint';
import type { DocumentedXPathFunction } from 'fontoxml-documentation-helpers/src/types';
import documentsManager from 'fontoxml-documents/src/documentsManager';
import type { NodeId } from 'fontoxml-dom-identification/src/types';
import namespaceManager from 'fontoxml-dom-namespaces/src/namespaceManager';
import type { FontoNode } from 'fontoxml-dom-utils/src/types';
import addTransform from 'fontoxml-operations/src/addTransform';
import operationsManager from 'fontoxml-operations/src/operationsManager';
import evaluateXPathToBoolean from 'fontoxml-selectors/src/evaluateXPathToBoolean';
import registerCustomXPathFunction from 'fontoxml-selectors/src/registerCustomXPathFunction';
import type { XQDynamicContext } from 'fontoxml-selectors/src/types';
import xq from 'fontoxml-selectors/src/xq';
import isTableNodeInstanceOfTableDefinition from 'fontoxml-table-flow/src/isTableNodeInstanceOfTableDefinition';

import toggleCellBorder from './custom-mutations/toggleCellBorder';
import CalsTableDefinition from './table-definition/CalsTableDefinition';

const FONTO_FUNCTIONS = namespaceManager.getNamespaceUri(null, 'fonto');

export default function install(): void {
	addCustomMutation('calsToggleCellBorder', toggleCellBorder);

	/**
	 * @remarks
	 * Returns whether the given node is a cals table node. This will return true for
	 * both table figure node (table) and table defining node (tgroup). If null or
	 * nothing is passed, the function will return false.
	 *
	 * @fontosdk
	 *
	 * @param node - The node to check
	 *
	 * @returns The result of the test as an xs:boolean
	 */
	const isCalsTableXPathFunction: DocumentedXPathFunction<
		{
			namespaceURI: typeof FONTO_FUNCTIONS;
			localName: 'is-cals-table';
		},
		['node()?'],
		'xs:boolean'
	> = [
		{
			namespaceURI: FONTO_FUNCTIONS,
			localName: 'is-cals-table',
		},
		['node()?'],
		'xs:boolean',
		function (
			dynamicContext: XQDynamicContext,
			node: FontoNode<'readable'>
		): boolean {
			return (
				node &&
				isTableNodeInstanceOfTableDefinition(
					dynamicContext.domFacade,
					node,
					CalsTableDefinition
				)
			);
		},
	];
	registerCustomXPathFunction(...isCalsTableXPathFunction);

	operationsManager.addAlternativeOperation(
		'set-cell-border-none',
		'cals-set-cell-border-none',
		0
	);
	operationsManager.addAlternativeOperation(
		'set-cell-border-all',
		'cals-set-cell-border-all',
		0
	);

	operationsManager.addAlternativeOperation(
		'set-cell-horizontal-alignment-left',
		'cals-set-cell-horizontal-alignment-left',
		0
	);
	operationsManager.addAlternativeOperation(
		'set-cell-horizontal-alignment-right',
		'cals-set-cell-horizontal-alignment-right',
		0
	);
	operationsManager.addAlternativeOperation(
		'set-cell-horizontal-alignment-center',
		'cals-set-cell-horizontal-alignment-center',
		0
	);
	operationsManager.addAlternativeOperation(
		'set-cell-horizontal-alignment-justify',
		'cals-set-cell-horizontal-alignment-justify',
		0
	);
	operationsManager.addAlternativeOperation(
		'set-cell-vertical-alignment-top',
		'cals-set-cell-vertical-alignment-top',
		0
	);
	operationsManager.addAlternativeOperation(
		'set-cell-vertical-alignment-bottom',
		'cals-set-cell-vertical-alignment-bottom',
		0
	);
	operationsManager.addAlternativeOperation(
		'set-cell-vertical-alignment-middle',
		'cals-set-cell-vertical-alignment-center',
		0
	);

	addTransform<{ cellNodeIds: NodeId[] }>(
		'checkCalsTableCell',
		function (stepData) {
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
						xq`ancestor::*[3][fonto:is-cals-table(.)]`,
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
		}
	);
}
