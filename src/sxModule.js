define([
	'fontoxml-modular-schema-experience/configurator',
	'fontoxml-table-flow/TableValidator',

	'./api/calsTableStructure',

    'text!./sx/operations.json'
], function(
	configurator,
	TableValidator,

	calsTableStructure,

    operationsJson
    ) {
    'use strict';

    var module = configurator.module('fontoxml-table-flow-cals');

    module.register('operations')
        .addOperations(JSON.parse(operationsJson));

	module.register('format')
		.addRestrictingValidator(new TableValidator(calsTableStructure));

    return module.getModuleName();
});

