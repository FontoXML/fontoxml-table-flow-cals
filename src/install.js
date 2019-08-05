import addCustomMutation from 'fontoxml-base-flow/src/addCustomMutation.js';
import toggleCellBorder from './custom-mutations/toggleCellBorder.js';
import operationsManager from 'fontoxml-operations/src/operationsManager.js';

export default function install() {
	addCustomMutation('calsToggleCellBorder', toggleCellBorder);
	operationsManager.addAlternativeOperation('set-cell-border-none', 'cals-set-cell-border-none');
	operationsManager.addAlternativeOperation('set-cell-border-all', 'cals-set-cell-border-all');
}
