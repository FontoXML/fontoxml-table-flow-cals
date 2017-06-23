define([
	'fontoxml-core',

	'./primitives/toggleCellBorder'
], function (
	core,

	toggleCellBorder
) {
	'use strict';

	var BlueprintedCommand = core.BlueprintedCommand;

	function draftValidBlueprint (argument, blueprint, format, _selectionRange, resultingState) {
		if (!argument.cellNodeIds.length) {
			// Not doing this check will not have an effect on performance, but it will produce an incorrect "active"
			// state, so we might as well exit early
			return false;
		}

		return toggleCellBorder(
			blueprint,
			format,
			resultingState,
			argument.cellNodeIds,
			argument.top,
			argument.bottom,
			argument.left,
			argument.right,
			argument.getState);
	}

	function ToggleCellBorderCommand () {
		BlueprintedCommand.call(this, draftValidBlueprint);
	}

	ToggleCellBorderCommand.prototype = Object.create(BlueprintedCommand.prototype);
	ToggleCellBorderCommand.prototype.constructor = ToggleCellBorderCommand;

	ToggleCellBorderCommand.prototype.getState = function (commandContext, argument) {
		argument.getState = true;

		var toReturn = BlueprintedCommand.prototype.getState.call(this, commandContext, argument);

		argument.getState = false;

		return toReturn;
	};

	return ToggleCellBorderCommand;
});
