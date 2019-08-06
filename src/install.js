import addCustomMutation from 'fontoxml-base-flow/src/addCustomMutation.js';
import toggleCellBorder from './custom-mutations/toggleCellBorder.js';
import operationsManager from 'fontoxml-operations/src/operationsManager.js';

export default function install() {
	addCustomMutation('calsToggleCellBorder', toggleCellBorder);
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
}
