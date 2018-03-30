define([
	'fontoxml-base-flow/addCustomMutation',

	'./custom-mutations/toggleCellBorder'
], function (
	addCustomMutation,

	toggleCellBorder
) {
	'use strict';

	return function install () {
		addCustomMutation('calsToggleCellBorder', toggleCellBorder);
	};
});
