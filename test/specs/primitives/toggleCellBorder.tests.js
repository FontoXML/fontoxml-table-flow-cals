define([
	'fontoxml-blueprints',
	'fontoxml-dom-identification/getNodeId',
	'fontoxml-core',
	'fontoxml-dom-utils/jsonMLMapper',
	'slimdom',

	'fontoxml-selectors/evaluateXPathToNodes',
	'fontoxml-table-flow',
	'fontoxml-table-flow-cals/buildGridModel',
	'fontoxml-table-flow-cals/calsTableStructure',
	'fontoxml-table-flow-cals/sx/commands/primitives/toggleCellBorder'
], function (
	blueprints,
	getNodeId,
	core,
	jsonMLMapper,
	slimdom,

	evaluateXPathToNodes,
	tableFlow,
	buildGridModel,
	calsTableStructure,
	toggleCellBorder
) {
	'use strict';

	var Blueprint = blueprints.Blueprint,
		CoreDocument = core.Document;

	var tableGridModelLookup = tableFlow.tableGridModelLookupSingleton;

	var singleCellTable = [
			'table',
			[
				'tgroup',
				{
					'cols': '1'
				},
				[
					'tbody',
					[
						'row',
						['entry']
					]
				]
			]
		];

	var multiCellTable = [
		'table',
		{ frame: 'all' },
		['tgroup', {
			'cols': '3'
		},
			['colspec', {
				colname: 'column-0',
				colnum: '1',
				colwidth: '1*',
				colsep: '0',
				rowsep: '1'
			}],
			['colspec', {
				colname: 'column-1',
				colnum: '2',
				colwidth: '1*',
				colsep: '0',
				rowsep: '1'
			}],
			['colspec', {
				colname: 'column-2',
				colnum: '3',
				colwidth: '1*',
				colsep: '0',
				rowsep: '1'
			}],
			['tbody',
				['row',
					['entry', { colsep: '0', rowsep: '0', colname: 'column-0' }],
					['entry', { colsep: '0', rowsep: '0', colname: 'column-1' }],
					['entry', { colsep: '0', rowsep: '0', colname: 'column-2' }]
				],
				['row',
					['entry', { colsep: '0', rowsep: '0', colname: 'column-0' }],
					['entry', { colsep: '0', rowsep: '0', namest: 'column-1', nameend: 'column-2', morerows: '1' }]
				],
				['row',
					['entry', { colsep: '0', rowsep: '0', colname: 'column-0' }]
				]
			]
		]
	];

	var stubFormat = {
			synthesizer: {
				completeStructure: () => true
			},
			validator: {
				validateDown: function () {
					return [];
				}
			}
		};

	describe('toggleCellBorderCommand', function () {
		var documentNode,
			coreDocument,
			blueprint;

		beforeEach(function () {
			documentNode = slimdom.createDocument();
			coreDocument = new CoreDocument(documentNode);

			blueprint = new Blueprint(coreDocument.dom);
		});

		it('is enabled and not active when no border will be changed', function () {
			coreDocument.dom.mutate(function () {
				jsonMLMapper.parse(
					singleCellTable,
					documentNode);
			});

			var tableElement = documentNode.firstChild,
				tgroupElement = tableElement.firstChild;

			tableGridModelLookup.addToLookup(tgroupElement, buildGridModel(calsTableStructure, tgroupElement, blueprint));
			var resultingState = {};
			var success = toggleCellBorder(
					blueprint,
					stubFormat,
					resultingState,
					evaluateXPathToNodes('//entry', tgroupElement, blueprint).map(getNodeId),
					undefined,
					undefined,
					undefined,
					undefined,
					false);

			chai.expect(success).to.equal(true);
			chai.expect(!!resultingState.active).to.equal(true);
			blueprint.realize();
			chai.expect(jsonMLMapper.serialize(tableElement)).to.deep.equal(singleCellTable);
		});

		it('is enabled and not active when border will be changed', function () {
			coreDocument.dom.mutate(function () {
				jsonMLMapper.parse(
					multiCellTable,
					documentNode);
			});

			var tableElement = documentNode.firstChild,
				tgroupElement = tableElement.firstChild;

			tableGridModelLookup.addToLookup(tgroupElement, buildGridModel(calsTableStructure, tgroupElement, blueprint));
			var resultingState = {};
			var success = toggleCellBorder(
				blueprint,
				stubFormat,
				resultingState,
				evaluateXPathToNodes('//row[2]//entry[2]', tgroupElement, blueprint).map(getNodeId),
				true,
				true,
				true,
				true,
				false);

			chai.expect(success).to.equal(true);
			chai.expect(!!resultingState.active).to.equal(false);
			blueprint.realize();
			chai.expect(jsonMLMapper.serialize(tableElement)).to.deep.equal([
				'table',
				{ frame: 'all' },
				['tgroup', {
					'cols': '3'
				},
					['colspec', {
						colname: 'column-0',
						colnum: '1',
						colwidth: '1*',
						colsep: '1', // colsep is set to '1' by table grid model, even though it is always overwritten on entry level
						rowsep: '1'
					}],
					['colspec', {
						colname: 'column-1',
						colnum: '2',
						colwidth: '1*',
						colsep: '1', // colsep is set to '1' by table grid model, even though it is always overwritten on entry level
						rowsep: '1'
					}],
					['colspec', {
						colname: 'column-2',
						colnum: '3',
						colwidth: '1*',
						colsep: '1', // colsep is set to '1' by table grid model, even though it is always overwritten on entry level
						rowsep: '1'
					}],
					['tbody',
						['row',
							['entry', { colsep: '0', rowsep: '0', colname: 'column-0' }],
							['entry', { colsep: '0', rowsep: '1', colname: 'column-1' }],
							['entry', { colsep: '0', rowsep: '1', colname: 'column-2' }]
						],
						['row',
							['entry', { colsep: '1', rowsep: '0', colname: 'column-0' }],
							['entry', { colsep: '1', rowsep: '1', namest: 'column-1', nameend: 'column-2', morerows: '1' }],
						],
						['row',
							['entry', { colsep: '1', rowsep: '0', colname: 'column-0' }]
						]
					]
				]
			]);
		});

		it('is enabled and not active when top- and bottom border will be changed', function () {
			coreDocument.dom.mutate(function () {
				jsonMLMapper.parse(
					multiCellTable,
					documentNode);
			});

			var tableElement = documentNode.firstChild,
				tgroupElement = tableElement.firstChild;

			tableGridModelLookup.addToLookup(tgroupElement, buildGridModel(calsTableStructure, tgroupElement, blueprint));
			var resultingState = {};
			var success = toggleCellBorder(
				blueprint,
				stubFormat,
				resultingState,
				evaluateXPathToNodes('//row[2]//entry[2]', tgroupElement, blueprint).map(getNodeId),
				true,
				true,
				false,
				false,
				false);

			chai.expect(success).to.equal(true);
			chai.expect(!!resultingState.active).to.equal(false);
			blueprint.realize();
			chai.expect(jsonMLMapper.serialize(tableElement)).to.deep.equal([
				'table',
				{ frame: 'all' },
				['tgroup', {
					'cols': '3'
				},
					['colspec', {
						colname: 'column-0',
						colnum: '1',
						colwidth: '1*',
						colsep: '1', // colsep is set to '1' by table grid model, even though it is always overwritten on entry level
						rowsep: '1'
					}],
					['colspec', {
						colname: 'column-1',
						colnum: '2',
						colwidth: '1*',
						colsep: '1', // colsep is set to '1' by table grid model, even though it is always overwritten on entry level
						rowsep: '1'
					}],
					['colspec', {
						colname: 'column-2',
						colnum: '3',
						colwidth: '1*',
						colsep: '1', // colsep is set to '1' by table grid model, even though it is always overwritten on entry level
						rowsep: '1'
					}],
					['tbody',
						['row',
							['entry', { colsep: '0', rowsep: '0', colname: 'column-0' }],
							['entry', { colsep: '0', rowsep: '1', colname: 'column-1' }],
							['entry', { colsep: '0', rowsep: '1', colname: 'column-2' }]
						],
						['row',
							['entry', { colsep: '0', rowsep: '0', colname: 'column-0' }],
							['entry', { colsep: '0', rowsep: '1', namest: 'column-1', nameend: 'column-2', morerows: '1' }],
						],
						['row',
							['entry', { colsep: '0', rowsep: '0', colname: 'column-0' }]
						]
					]
				]
			]);
		});

		it('is enabled and not active when left- and right bottom border will be changed', function () {
			coreDocument.dom.mutate(function () {
				jsonMLMapper.parse(
					multiCellTable,
					documentNode);
			});

			var tableElement = documentNode.firstChild,
				tgroupElement = tableElement.firstChild;

			tableGridModelLookup.addToLookup(tgroupElement, buildGridModel(calsTableStructure, tgroupElement, blueprint));
			var resultingState = {};
			var success = toggleCellBorder(
				blueprint,
				stubFormat,
				resultingState,
				evaluateXPathToNodes('//row[2]//entry[2]', tgroupElement, blueprint).map(getNodeId),
				false,
				false,
				true,
				true,
				false);

			chai.expect(success).to.equal(true);
			chai.expect(!!resultingState.active).to.equal(false);
			blueprint.realize();
			chai.expect(jsonMLMapper.serialize(tableElement)).to.deep.equal([
				'table',
				{ frame: 'all' },
				['tgroup', {
					'cols': '3'
				},
					['colspec', {
						colname: 'column-0',
						colnum: '1',
						colwidth: '1*',
						colsep: '1', // colsep is set to '1' by table grid model, even though it is always overwritten on entry level
						rowsep: '1'
					}],
					['colspec', {
						colname: 'column-1',
						colnum: '2',
						colwidth: '1*',
						colsep: '1', // colsep is set to '1' by table grid model, even though it is always overwritten on entry level
						rowsep: '1'
					}],
					['colspec', {
						colname: 'column-2',
						colnum: '3',
						colwidth: '1*',
						colsep: '1', // colsep is set to '1' by table grid model, even though it is always overwritten on entry level
						rowsep: '1'
					}],
					['tbody',
						['row',
							['entry', { colsep: '0', rowsep: '0', colname: 'column-0' }],
							['entry', { colsep: '0', rowsep: '0', colname: 'column-1' }],
							['entry', { colsep: '0', rowsep: '0', colname: 'column-2' }]
						],
						['row',
							['entry', { colsep: '1', rowsep: '0', colname: 'column-0' }],
							['entry', { colsep: '1', rowsep: '0', namest: 'column-1', nameend: 'column-2', morerows: '1' }],
						],
						['row',
							['entry', { colsep: '1', rowsep: '0', colname: 'column-0' }]
						]
					]
				]
			]);
		});

		it('is enabled and active when nothing is changed', function () {
			coreDocument.dom.mutate(function () {
				jsonMLMapper.parse(
					multiCellTable,
					documentNode);
			});

			var tableElement = documentNode.firstChild,
				tgroupElement = tableElement.firstChild;

			tableGridModelLookup.addToLookup(tgroupElement, buildGridModel(calsTableStructure, tgroupElement, blueprint));
			var resultingState = {};
			var success = toggleCellBorder(
				blueprint,
				stubFormat,
				resultingState,
				evaluateXPathToNodes('//row[2]//entry[2]', tgroupElement, blueprint).map(getNodeId),
				false,
				false,
				false,
				false,
				false);

			chai.expect(success).to.equal(true);
			chai.expect(!!resultingState.active).to.equal(true);
			blueprint.realize();
			chai.expect(jsonMLMapper.serialize(tableElement)).to.deep.equal([
				'table',
				{ frame: 'all' },
				['tgroup', {
					'cols': '3'
				},
					['colspec', {
						colname: 'column-0',
						colnum: '1',
						colwidth: '1*',
						colsep: '1', // colsep is set to '1' by table grid model, even though it is always overwritten on entry level
						rowsep: '1'
					}],
					['colspec', {
						colname: 'column-1',
						colnum: '2',
						colwidth: '1*',
						colsep: '1', // colsep is set to '1' by table grid model, even though it is always overwritten on entry level
						rowsep: '1'
					}],
					['colspec', {
						colname: 'column-2',
						colnum: '3',
						colwidth: '1*',
						colsep: '1', // colsep is set to '1' by table grid model, even though it is always overwritten on entry level
						rowsep: '1'
					}],
					['tbody',
						['row',
							['entry', { colsep: '0', rowsep: '0', colname: 'column-0' }],
							['entry', { colsep: '0', rowsep: '1', colname: 'column-1' }],
							['entry', { colsep: '0', rowsep: '1', colname: 'column-2' }]
						],
						['row',
							['entry', { colsep: '1', rowsep: '0', colname: 'column-0' }],
							['entry', { colsep: '1', rowsep: '1', namest: 'column-1', nameend: 'column-2', morerows: '1' }],
						],
						['row',
							['entry', { colsep: '1', rowsep: '0', colname: 'column-0' }]
						]
					]
				]
			]);
		});
	});
});
