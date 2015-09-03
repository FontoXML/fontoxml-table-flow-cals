define([
	'fontoxml-blueprints',
	'fontoxml-core',

	'./primitives/insertCalsTable'
], function (
	blueprints,
	core,

	insertCalsTable
	) {
	'use strict';

	var BlueprintedCommand = core.BlueprintedCommand,
		BlueprintPosition = blueprints.BlueprintPosition;

	function draftValidBlueprint (argument, blueprint, format, selectionRange) {
		// TODO: Accomodate for non collapsed range.

		if (!selectionRange.collapsed) {
			return false;
		}

		var blueprintPosition = BlueprintPosition.fromOffset(
				selectionRange.startContainer,
				selectionRange.startOffset,
				blueprint);

		var succes = insertCalsTable(
				argument,
				blueprintPosition,
				blueprint,
				format);

		return succes;
	}

	function InsertCalsTableCommand () {
		BlueprintedCommand.call(this, draftValidBlueprint);
	}

	InsertCalsTableCommand.prototype = Object.create(BlueprintedCommand.prototype);
	InsertCalsTableCommand.prototype.constructor = InsertCalsTableCommand;

	return InsertCalsTableCommand;
});

