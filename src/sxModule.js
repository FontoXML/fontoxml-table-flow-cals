define([
    'text!./schema-experience/operations.json'
], function(
    operationsJson
    ) {
    'use strict';

    var module = modularSchemaExperience.configurator.module('FontoXML:CalsTables');
    module.register('operations')
        .addOperations(JSON.parse(operationsJson));

    return module.getModuleName();
});



