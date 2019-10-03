import Blueprint from 'fontoxml-blueprints/Blueprint';
import CoreDocument from 'fontoxml-core/Document';
import evaluateXPathToBoolean from 'fontoxml-selectors/evaluateXPathToBoolean';
import jsonMLMapper from 'fontoxml-dom-utils/jsonMLMapper';
import namespaceManager from 'fontoxml-dom-namespaces/namespaceManager';
import * as slimdom from 'slimdom';

import CalsTableDefinition from 'fontoxml-table-flow-cals/table-definition/CalsTableDefinition';

const stubFormat = {
	synthesizer: {
		completeStructure: () => true
	},
	metadata: {
		get: (_option, _node) => false
	},
	validator: {
		canContain: () => true
	}
};

describe('CALS tables: Grid model to XML', () => {
	let blueprint;
	let coreDocument;
	let createTable;
	let documentNode;
	let tableDefinition;
	let tableNode;

	beforeEach(() => {
		documentNode = new slimdom.Document();
		coreDocument = new CoreDocument(documentNode);
		blueprint = new Blueprint(coreDocument.dom);

		tableNode = documentNode.createElement('table');

		tableDefinition = new CalsTableDefinition({
			table: {
				localName: 'table'
			}
		});
		createTable = tableDefinition.getTableGridModelBuilder();

		coreDocument.dom.mutate(() => {
			documentNode.appendChild(tableNode);
		});
	});

	describe('Basics', () => {
		it('can serialize a 1x1 table', () => {
			const tableGridModel = createTable(1, 1, false, documentNode);
			chai.assert.isTrue(
				tableDefinition.applyToDom(tableGridModel, tableNode, blueprint, stubFormat)
			);

			blueprint.realize();
			chai.assert.deepEqual(jsonMLMapper.serialize(documentNode.firstChild), [
				'table',
				{ frame: 'all' },
				[
					'tgroup',
					{ cols: '1' },
					[
						'colspec',
						{
							colname: 'column-0',
							colnum: '1',
							colwidth: '1*',
							colsep: '1',
							rowsep: '1'
						}
					],
					['tbody', ['row', ['entry', { colname: 'column-0', colsep: '1', rowsep: '1' }]]]
				]
			]);
		});

		it('can serialize a 4x4 table', () => {
			const tableGridModel = createTable(4, 4, false, documentNode);
			chai.assert.isTrue(
				tableDefinition.applyToDom(tableGridModel, tableNode, blueprint, stubFormat)
			);

			blueprint.realize();
			chai.assert.deepEqual(jsonMLMapper.serialize(documentNode.firstChild), [
				'table',
				{ frame: 'all' },
				[
					'tgroup',
					{ cols: '4' },
					[
						'colspec',
						{
							colname: 'column-0',
							colnum: '1',
							colwidth: '1*',
							colsep: '1',
							rowsep: '1'
						}
					],
					[
						'colspec',
						{
							colname: 'column-1',
							colnum: '2',
							colwidth: '1*',
							colsep: '1',
							rowsep: '1'
						}
					],
					[
						'colspec',
						{
							colname: 'column-2',
							colnum: '3',
							colwidth: '1*',
							colsep: '1',
							rowsep: '1'
						}
					],
					[
						'colspec',
						{
							colname: 'column-3',
							colnum: '4',
							colwidth: '1*',
							colsep: '1',
							rowsep: '1'
						}
					],
					[
						'tbody',
						[
							'row',
							['entry', { colname: 'column-0', colsep: '1', rowsep: '1' }],
							['entry', { colname: 'column-1', colsep: '1', rowsep: '1' }],
							['entry', { colname: 'column-2', colsep: '1', rowsep: '1' }],
							['entry', { colname: 'column-3', colsep: '1', rowsep: '1' }]
						],
						[
							'row',
							['entry', { colname: 'column-0', colsep: '1', rowsep: '1' }],
							['entry', { colname: 'column-1', colsep: '1', rowsep: '1' }],
							['entry', { colname: 'column-2', colsep: '1', rowsep: '1' }],
							['entry', { colname: 'column-3', colsep: '1', rowsep: '1' }]
						],
						[
							'row',
							['entry', { colname: 'column-0', colsep: '1', rowsep: '1' }],
							['entry', { colname: 'column-1', colsep: '1', rowsep: '1' }],
							['entry', { colname: 'column-2', colsep: '1', rowsep: '1' }],
							['entry', { colname: 'column-3', colsep: '1', rowsep: '1' }]
						],
						[
							'row',
							['entry', { colname: 'column-0', colsep: '1', rowsep: '1' }],
							['entry', { colname: 'column-1', colsep: '1', rowsep: '1' }],
							['entry', { colname: 'column-2', colsep: '1', rowsep: '1' }],
							['entry', { colname: 'column-3', colsep: '1', rowsep: '1' }]
						]
					]
				]
			]);
		});
	});

	describe('Headers', () => {
		it('can serialize a 4x4 table with 1 header row', () => {
			const tableGridModel = createTable(4, 4, true, documentNode);
			chai.assert.isTrue(
				tableDefinition.applyToDom(tableGridModel, tableNode, blueprint, stubFormat)
			);

			blueprint.realize();
			chai.assert.deepEqual(jsonMLMapper.serialize(documentNode.firstChild), [
				'table',
				{ frame: 'all' },
				[
					'tgroup',
					{ cols: '4' },
					[
						'colspec',
						{
							colname: 'column-0',
							colnum: '1',
							colwidth: '1*',
							colsep: '1',
							rowsep: '1'
						}
					],
					[
						'colspec',
						{
							colname: 'column-1',
							colnum: '2',
							colwidth: '1*',
							colsep: '1',
							rowsep: '1'
						}
					],
					[
						'colspec',
						{
							colname: 'column-2',
							colnum: '3',
							colwidth: '1*',
							colsep: '1',
							rowsep: '1'
						}
					],
					[
						'colspec',
						{
							colname: 'column-3',
							colnum: '4',
							colwidth: '1*',
							colsep: '1',
							rowsep: '1'
						}
					],
					[
						'thead',
						[
							'row',
							['entry', { colname: 'column-0', colsep: '1', rowsep: '1' }],
							['entry', { colname: 'column-1', colsep: '1', rowsep: '1' }],
							['entry', { colname: 'column-2', colsep: '1', rowsep: '1' }],
							['entry', { colname: 'column-3', colsep: '1', rowsep: '1' }]
						]
					],
					[
						'tbody',
						[
							'row',
							['entry', { colname: 'column-0', colsep: '1', rowsep: '1' }],
							['entry', { colname: 'column-1', colsep: '1', rowsep: '1' }],
							['entry', { colname: 'column-2', colsep: '1', rowsep: '1' }],
							['entry', { colname: 'column-3', colsep: '1', rowsep: '1' }]
						],
						[
							'row',
							['entry', { colname: 'column-0', colsep: '1', rowsep: '1' }],
							['entry', { colname: 'column-1', colsep: '1', rowsep: '1' }],
							['entry', { colname: 'column-2', colsep: '1', rowsep: '1' }],
							['entry', { colname: 'column-3', colsep: '1', rowsep: '1' }]
						],
						[
							'row',
							['entry', { colname: 'column-0', colsep: '1', rowsep: '1' }],
							['entry', { colname: 'column-1', colsep: '1', rowsep: '1' }],
							['entry', { colname: 'column-2', colsep: '1', rowsep: '1' }],
							['entry', { colname: 'column-3', colsep: '1', rowsep: '1' }]
						]
					]
				]
			]);
		});
	});

	describe('Spanning cells', () => {
		it('can serialize a 4x4 table with 1 column spanning cell', () => {
			const tableGridModel = createTable(4, 4, false, documentNode);
			const spanningCell = tableGridModel.getCellAtCoordinates(1, 1);
			spanningCell.size.columns = 2;

			tableGridModel.setCellAtCoordinates(spanningCell, 1, 1);
			tableGridModel.setCellAtCoordinates(spanningCell, 1, 2);

			chai.assert.isTrue(
				tableDefinition.applyToDom(tableGridModel, tableNode, blueprint, stubFormat)
			);

			blueprint.realize();
			chai.assert.deepEqual(jsonMLMapper.serialize(documentNode.firstChild), [
				'table',
				{ frame: 'all' },
				[
					'tgroup',
					{ cols: '4' },
					[
						'colspec',
						{
							colname: 'column-0',
							colnum: '1',
							colwidth: '1*',
							colsep: '1',
							rowsep: '1'
						}
					],
					[
						'colspec',
						{
							colname: 'column-1',
							colnum: '2',
							colwidth: '1*',
							colsep: '1',
							rowsep: '1'
						}
					],
					[
						'colspec',
						{
							colname: 'column-2',
							colnum: '3',
							colwidth: '1*',
							colsep: '1',
							rowsep: '1'
						}
					],
					[
						'colspec',
						{
							colname: 'column-3',
							colnum: '4',
							colwidth: '1*',
							colsep: '1',
							rowsep: '1'
						}
					],
					[
						'tbody',
						[
							'row',
							['entry', { colname: 'column-0', colsep: '1', rowsep: '1' }],
							['entry', { colname: 'column-1', colsep: '1', rowsep: '1' }],
							['entry', { colname: 'column-2', colsep: '1', rowsep: '1' }],
							['entry', { colname: 'column-3', colsep: '1', rowsep: '1' }]
						],
						[
							'row',
							['entry', { colname: 'column-0', colsep: '1', rowsep: '1' }],
							[
								'entry',
								{
									namest: 'column-1',
									nameend: 'column-2',
									colsep: '1',
									rowsep: '1'
								}
							],
							['entry', { colname: 'column-3', colsep: '1', rowsep: '1' }]
						],
						[
							'row',
							['entry', { colname: 'column-0', colsep: '1', rowsep: '1' }],
							['entry', { colname: 'column-1', colsep: '1', rowsep: '1' }],
							['entry', { colname: 'column-2', colsep: '1', rowsep: '1' }],
							['entry', { colname: 'column-3', colsep: '1', rowsep: '1' }]
						],
						[
							'row',
							['entry', { colname: 'column-0', colsep: '1', rowsep: '1' }],
							['entry', { colname: 'column-1', colsep: '1', rowsep: '1' }],
							['entry', { colname: 'column-2', colsep: '1', rowsep: '1' }],
							['entry', { colname: 'column-3', colsep: '1', rowsep: '1' }]
						]
					]
				]
			]);
		});

		it('can serialize a 4x4 table with 1 row spanning cell', () => {
			const tableGridModel = createTable(4, 4, false, documentNode);
			const spanningCell = tableGridModel.getCellAtCoordinates(1, 1);
			spanningCell.size.rows = 2;

			tableGridModel.setCellAtCoordinates(spanningCell, 1, 1);
			tableGridModel.setCellAtCoordinates(spanningCell, 2, 1);

			chai.assert.isTrue(
				tableDefinition.applyToDom(tableGridModel, tableNode, blueprint, stubFormat)
			);

			blueprint.realize();
			chai.assert.deepEqual(jsonMLMapper.serialize(documentNode.firstChild), [
				'table',
				{ frame: 'all' },
				[
					'tgroup',
					{ cols: '4' },
					[
						'colspec',
						{
							colname: 'column-0',
							colnum: '1',
							colwidth: '1*',
							colsep: '1',
							rowsep: '1'
						}
					],
					[
						'colspec',
						{
							colname: 'column-1',
							colnum: '2',
							colwidth: '1*',
							colsep: '1',
							rowsep: '1'
						}
					],
					[
						'colspec',
						{
							colname: 'column-2',
							colnum: '3',
							colwidth: '1*',
							colsep: '1',
							rowsep: '1'
						}
					],
					[
						'colspec',
						{
							colname: 'column-3',
							colnum: '4',
							colwidth: '1*',
							colsep: '1',
							rowsep: '1'
						}
					],
					[
						'tbody',
						[
							'row',
							['entry', { colname: 'column-0', colsep: '1', rowsep: '1' }],
							['entry', { colname: 'column-1', colsep: '1', rowsep: '1' }],
							['entry', { colname: 'column-2', colsep: '1', rowsep: '1' }],
							['entry', { colname: 'column-3', colsep: '1', rowsep: '1' }]
						],
						[
							'row',
							['entry', { colname: 'column-0', colsep: '1', rowsep: '1' }],
							[
								'entry',
								{ colname: 'column-1', morerows: '1', colsep: '1', rowsep: '1' }
							],
							['entry', { colname: 'column-2', colsep: '1', rowsep: '1' }],
							['entry', { colname: 'column-3', colsep: '1', rowsep: '1' }]
						],
						[
							'row',
							['entry', { colname: 'column-0', colsep: '1', rowsep: '1' }],
							['entry', { colname: 'column-2', colsep: '1', rowsep: '1' }],
							['entry', { colname: 'column-3', colsep: '1', rowsep: '1' }]
						],
						[
							'row',
							['entry', { colname: 'column-0', colsep: '1', rowsep: '1' }],
							['entry', { colname: 'column-1', colsep: '1', rowsep: '1' }],
							['entry', { colname: 'column-2', colsep: '1', rowsep: '1' }],
							['entry', { colname: 'column-3', colsep: '1', rowsep: '1' }]
						]
					]
				]
			]);
		});

		it('can serialize a 4x4 table with 1 column and row spanning cell', () => {
			const tableGridModel = createTable(4, 4, false, documentNode);
			const spanningCell = tableGridModel.getCellAtCoordinates(1, 1);
			spanningCell.size.columns = 2;
			spanningCell.size.rows = 2;

			tableGridModel.setCellAtCoordinates(spanningCell, 1, 1);
			tableGridModel.setCellAtCoordinates(spanningCell, 1, 2);
			tableGridModel.setCellAtCoordinates(spanningCell, 2, 1);
			tableGridModel.setCellAtCoordinates(spanningCell, 2, 2);

			chai.assert.isTrue(
				tableDefinition.applyToDom(tableGridModel, tableNode, blueprint, stubFormat)
			);

			blueprint.realize();
			chai.assert.deepEqual(jsonMLMapper.serialize(documentNode.firstChild), [
				'table',
				{ frame: 'all' },
				[
					'tgroup',
					{ cols: '4' },
					[
						'colspec',
						{
							colname: 'column-0',
							colnum: '1',
							colwidth: '1*',
							colsep: '1',
							rowsep: '1'
						}
					],
					[
						'colspec',
						{
							colname: 'column-1',
							colnum: '2',
							colwidth: '1*',
							colsep: '1',
							rowsep: '1'
						}
					],
					[
						'colspec',
						{
							colname: 'column-2',
							colnum: '3',
							colwidth: '1*',
							colsep: '1',
							rowsep: '1'
						}
					],
					[
						'colspec',
						{
							colname: 'column-3',
							colnum: '4',
							colwidth: '1*',
							colsep: '1',
							rowsep: '1'
						}
					],
					[
						'tbody',
						[
							'row',
							['entry', { colname: 'column-0', colsep: '1', rowsep: '1' }],
							['entry', { colname: 'column-1', colsep: '1', rowsep: '1' }],
							['entry', { colname: 'column-2', colsep: '1', rowsep: '1' }],
							['entry', { colname: 'column-3', colsep: '1', rowsep: '1' }]
						],
						[
							'row',
							['entry', { colname: 'column-0', colsep: '1', rowsep: '1' }],
							[
								'entry',
								{
									namest: 'column-1',
									nameend: 'column-2',
									morerows: '1',
									colsep: '1',
									rowsep: '1'
								}
							],
							['entry', { colname: 'column-3', colsep: '1', rowsep: '1' }]
						],
						[
							'row',
							['entry', { colname: 'column-0', colsep: '1', rowsep: '1' }],
							['entry', { colname: 'column-3', colsep: '1', rowsep: '1' }]
						],
						[
							'row',
							['entry', { colname: 'column-0', colsep: '1', rowsep: '1' }],
							['entry', { colname: 'column-1', colsep: '1', rowsep: '1' }],
							['entry', { colname: 'column-2', colsep: '1', rowsep: '1' }],
							['entry', { colname: 'column-3', colsep: '1', rowsep: '1' }]
						]
					]
				]
			]);
		});
	});

	describe('Namespaces', () => {
		it('can serialize a 4x4 table with namespaces and non-default names for thead and tfoot', () => {
			namespaceManager.addNamespace('ns1', 'http://example.com/ns1');
			namespaceManager.addNamespace('ns2', 'http://example.com/ns2');

			const tableDefinition = new CalsTableDefinition({
				table: {
					localName: 'matrix',
					namespaceURI: 'http://example.com/ns1'
				},
				tgroup: {
					namespaceURI: 'http://example.com/ns2'
				}
			});
			const createTable = tableDefinition.getTableGridModelBuilder();
			const tableGridModel = createTable(4, 4, true, documentNode, 'ns2:entry');

			const tableNodeWithNamespace = documentNode.createElementNS(
				'http://example.com/ns1',
				'ns1:matrix'
			);
			const tgroupNodeWithNamespace = documentNode.createElementNS(
				'http://example.com/ns2',
				'ns2:tgroup'
			);
			tableNodeWithNamespace.appendChild(tgroupNodeWithNamespace);

			chai.assert.isTrue(
				tableDefinition.applyToDom(
					tableGridModel,
					tgroupNodeWithNamespace,
					blueprint,
					stubFormat
				)
			);

			blueprint.realize();
			chai.assert.deepEqual(jsonMLMapper.serialize(tableNodeWithNamespace), [
				'ns1:matrix',
				{ frame: 'all' },
				[
					'ns2:tgroup',
					{ cols: '4' },
					[
						'ns2:colspec',
						{
							colname: 'column-0',
							colnum: '1',
							colwidth: '1*',
							colsep: '1',
							rowsep: '1'
						}
					],
					[
						'ns2:colspec',
						{
							colname: 'column-1',
							colnum: '2',
							colwidth: '1*',
							colsep: '1',
							rowsep: '1'
						}
					],
					[
						'ns2:colspec',
						{
							colname: 'column-2',
							colnum: '3',
							colwidth: '1*',
							colsep: '1',
							rowsep: '1'
						}
					],
					[
						'ns2:colspec',
						{
							colname: 'column-3',
							colnum: '4',
							colwidth: '1*',
							colsep: '1',
							rowsep: '1'
						}
					],
					[
						'ns2:thead',
						[
							'ns2:row',
							['ns2:entry', { colname: 'column-0', colsep: '1', rowsep: '1' }],
							['ns2:entry', { colname: 'column-1', colsep: '1', rowsep: '1' }],
							['ns2:entry', { colname: 'column-2', colsep: '1', rowsep: '1' }],
							['ns2:entry', { colname: 'column-3', colsep: '1', rowsep: '1' }]
						]
					],
					[
						'ns2:tbody',
						[
							'ns2:row',
							['ns2:entry', { colname: 'column-0', colsep: '1', rowsep: '1' }],
							['ns2:entry', { colname: 'column-1', colsep: '1', rowsep: '1' }],
							['ns2:entry', { colname: 'column-2', colsep: '1', rowsep: '1' }],
							['ns2:entry', { colname: 'column-3', colsep: '1', rowsep: '1' }]
						],
						[
							'ns2:row',
							['ns2:entry', { colname: 'column-0', colsep: '1', rowsep: '1' }],
							['ns2:entry', { colname: 'column-1', colsep: '1', rowsep: '1' }],
							['ns2:entry', { colname: 'column-2', colsep: '1', rowsep: '1' }],
							['ns2:entry', { colname: 'column-3', colsep: '1', rowsep: '1' }]
						],
						[
							'ns2:row',
							['ns2:entry', { colname: 'column-0', colsep: '1', rowsep: '1' }],
							['ns2:entry', { colname: 'column-1', colsep: '1', rowsep: '1' }],
							['ns2:entry', { colname: 'column-2', colsep: '1', rowsep: '1' }],
							['ns2:entry', { colname: 'column-3', colsep: '1', rowsep: '1' }]
						]
					]
				]
			]);

			chai.assert.isTrue(
				evaluateXPathToBoolean('deep-equal($a, $b)', null, blueprint, {
					a: tableNodeWithNamespace,
					b: new DOMParser().parseFromString(
						[
							'<matrix frame="all" xmlns="http://example.com/ns1">',
							'<tgroup cols="4" xmlns="http://example.com/ns2">',
							'<colspec colname="column-0" colnum="1" colwidth="1*" colsep="1" rowsep="1" /><colspec colname="column-1" colnum="2" colwidth="1*" colsep="1" rowsep="1" /><colspec colname="column-2" colnum="3" colwidth="1*" colsep="1" rowsep="1" /><colspec colname="column-3" colnum="4" colwidth="1*" colsep="1" rowsep="1" />',
							'<thead><row><entry colname="column-0" colsep="1" rowsep="1" /><entry colname="column-1" colsep="1" rowsep="1" /><entry colname="column-2" colsep="1" rowsep="1" /><entry colname="column-3" colsep="1" rowsep="1" /></row></thead>',
							'<tbody>',
							'<row><entry colname="column-0" colsep="1" rowsep="1" /><entry colname="column-1" colsep="1" rowsep="1" /><entry colname="column-2" colsep="1" rowsep="1" /><entry colname="column-3" colsep="1" rowsep="1" /></row>',
							'<row><entry colname="column-0" colsep="1" rowsep="1" /><entry colname="column-1" colsep="1" rowsep="1" /><entry colname="column-2" colsep="1" rowsep="1" /><entry colname="column-3" colsep="1" rowsep="1" /></row>',
							'<row><entry colname="column-0" colsep="1" rowsep="1" /><entry colname="column-1" colsep="1" rowsep="1" /><entry colname="column-2" colsep="1" rowsep="1" /><entry colname="column-3" colsep="1" rowsep="1" /></row>',
							'</tbody>',
							'</tgroup>',
							'</matrix>'
						].join(''),
						'text/xml'
					).documentElement
				}),
				'deep equal'
			);
		});
	});
});
