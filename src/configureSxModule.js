define([
	'./commands/ToggleCellBorderCommand'
], function (
	ToggleCellBorderCommand
) {
	'use strict';

	return function configureSxModule (sxModule) {
		sxModule.configure('commands')
			.addCommand('toggle-cell-border', new ToggleCellBorderCommand());
	};
});
