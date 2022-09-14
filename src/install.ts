import addCustomMutation from 'fontoxml-base-flow/src/addCustomMutation';
import readOnlyBlueprint from 'fontoxml-blueprints/src/readOnlyBlueprint';
import documentsManager from 'fontoxml-documents/src/documentsManager';
import type { NodeId } from 'fontoxml-dom-identification/src/types';
import addTransform from 'fontoxml-operations/src/addTransform';
import operationsManager from 'fontoxml-operations/src/operationsManager';
import evaluateXPathToBoolean from 'fontoxml-selectors/src/evaluateXPathToBoolean';
import registerCustomXPathFunction from 'fontoxml-selectors/src/registerCustomXPathFunction';
import xq from 'fontoxml-selectors/src/xq';

import toggleCellBorder from './custom-mutations/toggleCellBorder';
import isCalsTable from './custom-xpath-functions/isCalsTable';

export default function install(): void {
	addCustomMutation('calsToggleCellBorder', toggleCellBorder);

	registerCustomXPathFunction(...isCalsTable);

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
