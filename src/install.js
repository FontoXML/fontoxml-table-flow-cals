import addCustomMutation from 'fontoxml-base-flow/src/addCustomMutation.js';
import toggleCellBorder from './custom-mutations/toggleCellBorder.js';

export default function install() {
	addCustomMutation('calsToggleCellBorder', toggleCellBorder);
}
