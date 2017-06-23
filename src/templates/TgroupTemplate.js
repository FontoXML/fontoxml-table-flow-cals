define([
	'fontoxml-families/replaceBlockWidgetAreaPlaceholdersInJsonMl',
	'fontoxml-table-flow',
	'fontoxml-templated-views/JsonMlTemplate'
], function (
	replaceBlockWidgetAreaPlaceholdersInJsonMl,
	tableFlow,
	JsonMlTemplate
) {
	'use strict';

	var tableGridModelLookupSingleton = tableFlow.tableGridModelLookupSingleton;

	var DEFAULT_VISUALIZATION = {};

	// TODO: we really shouldn't need to override the fontoxml-families table template for this, just add the border
	// as a visualization option and use selectors to match the frame attribute...
	function TgroupTemplate (visualization) {
		visualization = Object.assign({}, DEFAULT_VISUALIZATION, visualization);

		JsonMlTemplate.call(this, function createTableJsonMl (sourceNode, renderer) {
			var tableGridModel = tableGridModelLookupSingleton.getGridModel(sourceNode.parentNode);

			var jsonMl = ['cv-table',
					{
						'node-id': sourceNode.nodeId
					},
					['cv-block-boundary',
						['cv-block-body',
							['cv-content',
								['table',
									{
										'cv-table-border': tableGridModel.borders ? 'all' : 'none'
									},
									renderer.createTraversalPlaceholder()
								],
								// Work-around for tables appearing selected in Chrome if the next element is selected
								// and starts with a non-contentEditable (such as our widget areas)
								// https://bugs.chromium.org/p/chromium/issues/detail?id=591347
								['chrome-selection-workaround']
							]
						]
					]
				];

			return replaceBlockWidgetAreaPlaceholdersInJsonMl(jsonMl, sourceNode, renderer, visualization);
		}, 'table');
	}

	TgroupTemplate.prototype = Object.create(JsonMlTemplate.prototype);
	TgroupTemplate.prototype.constructor = TgroupTemplate;

	return TgroupTemplate;
});
