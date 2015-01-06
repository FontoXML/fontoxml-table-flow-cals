define(
	[
		'fontoxml-base-flow',
		'fontoxml-blueprints',

		'../primitives/insertCalsTable'
	],
	function (
		baseFlow,
		blueprints,

		insertCalsTable
		) {
		'use strict';

		var BlueprintedCommand = baseFlow.BlueprintedCommand,
			BlueprintPosition = blueprints.BlueprintPosition;

		function draftValidBlueprint (argument, blueprint, format, selectionRange) {
			// @TODO: Accomodate for non collapsed range.

			if (!selectionRange.collapsed) {
				return false;
			}

			var blueprintPosition = BlueprintPosition.fromOffset(
				selectionRange.startContainer,
				selectionRange.startOffset,
				blueprint);

			var succes = insertCalsTable(
					argument.hasHeader,
					argument.rows,
					argument.columns,
					blueprintPosition,
					blueprint,
					format,
					selectionRange);

			return succes;
		}

		function InsertCalsTableCommand () {
			BlueprintedCommand.call(this, draftValidBlueprint);
		}

		InsertCalsTableCommand.prototype = Object.create(BlueprintedCommand.prototype);
		InsertCalsTableCommand.prototype.constructor = InsertCalsTableCommand;

		return InsertCalsTableCommand;
	}
);