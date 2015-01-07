define([
	'fontoxml-modular-schema-experience',

    'text!./sx/operations.json'
], function(
	modularSchemaExperience,

    operationsJson
    ) {
    'use strict';

    var module = modularSchemaExperience.configurator.module('FontoXML:CalsTables');
    module.register('operations')
        .addOperations(JSON.parse(operationsJson));

    return module.getModuleName();
});



