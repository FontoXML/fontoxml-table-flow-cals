define([
	'fontoxml-families/determineCommonVisualizationOptions',
	'fontoxml-families/mapBlockBodyVisualizationOptionsToCvAttributes',
	'fontoxml-families/mapCommonVisualizationOptionsToCvAttributes',
	'fontoxml-families/replaceBlockWidgetAreaPlaceholdersInJsonMl',
	'fontoxml-table-flow',
	'fontoxml-templated-views/JsonMlTemplate'
], function (
	determineCommonVisualizationOptions,
	mapBlockBodyVisualizationOptionsToCvAttributes,
	mapCommonVisualizationOptionsToCvAttributes,
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
		JsonMlTemplate.call(this, function createTableJsonMl (sourceNode, renderer) {
			var finalVisualization = Object.assign(
				{},
				DEFAULT_VISUALIZATION,
				visualization,
				determineCommonVisualizationOptions(sourceNode, renderer));
			var tableGridModel = tableGridModelLookupSingleton.getGridModel(sourceNode.parentNode);

			var jsonMl = ['cv-table',
					Object.assign(
						{},
						mapCommonVisualizationOptionsToCvAttributes(sourceNode, finalVisualization),
						{
							'node-id': sourceNode.nodeId
						}
					),
					'{{blockOutsideBefore}}',
					'{{blockOutsideAfter}}',
					['cv-block-boundary',
						'{{blockHeader}}',
						['cv-block-body',
							mapBlockBodyVisualizationOptionsToCvAttributes(finalVisualization),
							'{{blockBefore}}',
							'{{blockAfter}}',
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
						],
						'{{blockFooter}}'
					]
				];

			return replaceBlockWidgetAreaPlaceholdersInJsonMl(jsonMl, sourceNode, renderer, finalVisualization);
		}, 'table');
	}

	TgroupTemplate.prototype = Object.create(JsonMlTemplate.prototype);
	TgroupTemplate.prototype.constructor = TgroupTemplate;

	return TgroupTemplate;
});
