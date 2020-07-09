import Blueprint from 'fontoxml-blueprints/src/Blueprint.js';
import CoreDocument from 'fontoxml-core/src/Document.js';
import indicesManager from 'fontoxml-indices/src/indicesManager.js';
import evaluateXPathToBoolean from 'fontoxml-selectors/src/evaluateXPathToBoolean.js';
import jsonMLMapper from 'fontoxml-dom-utils/src/jsonMLMapper.js';
import namespaceManager from 'fontoxml-dom-namespaces/src/namespaceManager.js';
import * as slimdom from 'slimdom';

import CalsTableDefinition from 'fontoxml-table-flow-cals/src/table-definition/CalsTableDefinition.js';

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
			indicesManager.getIndexSet().commitMerge();
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
							colwidth: '1*'
						}
					],
					['tbody', ['row', ['entry', { colname: 'column-0' }]]]
				]
			]);
		});

		it('can serialize a 4x4 table', () => {
			const tableGridModel = createTable(4, 4, false, documentNode);
			chai.assert.isTrue(
				tableDefinition.applyToDom(tableGridModel, tableNode, blueprint, stubFormat)
			);

			blueprint.realize();
			indicesManager.getIndexSet().commitMerge();
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
							colwidth: '1*'
						}
					],
					[
						'colspec',
						{
							colname: 'column-1',
							colnum: '2',
							colwidth: '1*'
						}
					],
					[
						'colspec',
						{
							colname: 'column-2',
							colnum: '3',
							colwidth: '1*'
						}
					],
					[
						'colspec',
						{
							colname: 'column-3',
							colnum: '4',
							colwidth: '1*'
						}
					],
					[
						'tbody',
						[
							'row',
							['entry', { colname: 'column-0' }],
							['entry', { colname: 'column-1' }],
							['entry', { colname: 'column-2' }],
							['entry', { colname: 'column-3' }]
						],
						[
							'row',
							['entry', { colname: 'column-0' }],
							['entry', { colname: 'column-1' }],
							['entry', { colname: 'column-2' }],
							['entry', { colname: 'column-3' }]
						],
						[
							'row',
							['entry', { colname: 'column-0' }],
							['entry', { colname: 'column-1' }],
							['entry', { colname: 'column-2' }],
							['entry', { colname: 'column-3' }]
						],
						[
							'row',
							['entry', { colname: 'column-0' }],
							['entry', { colname: 'column-1' }],
							['entry', { colname: 'column-2' }],
							['entry', { colname: 'column-3' }]
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
			indicesManager.getIndexSet().commitMerge();
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
							colwidth: '1*'
						}
					],
					[
						'colspec',
						{
							colname: 'column-1',
							colnum: '2',
							colwidth: '1*'
						}
					],
					[
						'colspec',
						{
							colname: 'column-2',
							colnum: '3',
							colwidth: '1*'
						}
					],
					[
						'colspec',
						{
							colname: 'column-3',
							colnum: '4',
							colwidth: '1*'
						}
					],
					[
						'thead',
						[
							'row',
							['entry', { colname: 'column-0' }],
							['entry', { colname: 'column-1' }],
							['entry', { colname: 'column-2' }],
							['entry', { colname: 'column-3' }]
						]
					],
					[
						'tbody',
						[
							'row',
							['entry', { colname: 'column-0' }],
							['entry', { colname: 'column-1' }],
							['entry', { colname: 'column-2' }],
							['entry', { colname: 'column-3' }]
						],
						[
							'row',
							['entry', { colname: 'column-0' }],
							['entry', { colname: 'column-1' }],
							['entry', { colname: 'column-2' }],
							['entry', { colname: 'column-3' }]
						],
						[
							'row',
							['entry', { colname: 'column-0' }],
							['entry', { colname: 'column-1' }],
							['entry', { colname: 'column-2' }],
							['entry', { colname: 'column-3' }]
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
			indicesManager.getIndexSet().commitMerge();
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
							colwidth: '1*'
						}
					],
					[
						'colspec',
						{
							colname: 'column-1',
							colnum: '2',
							colwidth: '1*'
						}
					],
					[
						'colspec',
						{
							colname: 'column-2',
							colnum: '3',
							colwidth: '1*'
						}
					],
					[
						'colspec',
						{
							colname: 'column-3',
							colnum: '4',
							colwidth: '1*'
						}
					],
					[
						'tbody',
						[
							'row',
							['entry', { colname: 'column-0' }],
							['entry', { colname: 'column-1' }],
							['entry', { colname: 'column-2' }],
							['entry', { colname: 'column-3' }]
						],
						[
							'row',
							['entry', { colname: 'column-0' }],
							[
								'entry',
								{
									namest: 'column-1',
									nameend: 'column-2'
								}
							],
							['entry', { colname: 'column-3' }]
						],
						[
							'row',
							['entry', { colname: 'column-0' }],
							['entry', { colname: 'column-1' }],
							['entry', { colname: 'column-2' }],
							['entry', { colname: 'column-3' }]
						],
						[
							'row',
							['entry', { colname: 'column-0' }],
							['entry', { colname: 'column-1' }],
							['entry', { colname: 'column-2' }],
							['entry', { colname: 'column-3' }]
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
			indicesManager.getIndexSet().commitMerge();
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
							colwidth: '1*'
						}
					],
					[
						'colspec',
						{
							colname: 'column-1',
							colnum: '2',
							colwidth: '1*'
						}
					],
					[
						'colspec',
						{
							colname: 'column-2',
							colnum: '3',
							colwidth: '1*'
						}
					],
					[
						'colspec',
						{
							colname: 'column-3',
							colnum: '4',
							colwidth: '1*'
						}
					],
					[
						'tbody',
						[
							'row',
							['entry', { colname: 'column-0' }],
							['entry', { colname: 'column-1' }],
							['entry', { colname: 'column-2' }],
							['entry', { colname: 'column-3' }]
						],
						[
							'row',
							['entry', { colname: 'column-0' }],
							['entry', { colname: 'column-1', morerows: '1' }],
							['entry', { colname: 'column-2' }],
							['entry', { colname: 'column-3' }]
						],
						[
							'row',
							['entry', { colname: 'column-0' }],
							['entry', { colname: 'column-2' }],
							['entry', { colname: 'column-3' }]
						],
						[
							'row',
							['entry', { colname: 'column-0' }],
							['entry', { colname: 'column-1' }],
							['entry', { colname: 'column-2' }],
							['entry', { colname: 'column-3' }]
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
			indicesManager.getIndexSet().commitMerge();
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
							colwidth: '1*'
						}
					],
					[
						'colspec',
						{
							colname: 'column-1',
							colnum: '2',
							colwidth: '1*'
						}
					],
					[
						'colspec',
						{
							colname: 'column-2',
							colnum: '3',
							colwidth: '1*'
						}
					],
					[
						'colspec',
						{
							colname: 'column-3',
							colnum: '4',
							colwidth: '1*'
						}
					],
					[
						'tbody',
						[
							'row',
							['entry', { colname: 'column-0' }],
							['entry', { colname: 'column-1' }],
							['entry', { colname: 'column-2' }],
							['entry', { colname: 'column-3' }]
						],
						[
							'row',
							['entry', { colname: 'column-0' }],
							[
								'entry',
								{
									namest: 'column-1',
									nameend: 'column-2',
									morerows: '1'
								}
							],
							['entry', { colname: 'column-3' }]
						],
						[
							'row',
							['entry', { colname: 'column-0' }],
							['entry', { colname: 'column-3' }]
						],
						[
							'row',
							['entry', { colname: 'column-0' }],
							['entry', { colname: 'column-1' }],
							['entry', { colname: 'column-2' }],
							['entry', { colname: 'column-3' }]
						]
					]
				]
			]);
		});
	});

	describe('Namespaces', () => {
		it('can serialize a 4x4 table with namespaces and non-default names for thead', () => {
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
			indicesManager.getIndexSet().commitMerge();
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
							colwidth: '1*'
						}
					],
					[
						'ns2:colspec',
						{
							colname: 'column-1',
							colnum: '2',
							colwidth: '1*'
						}
					],
					[
						'ns2:colspec',
						{
							colname: 'column-2',
							colnum: '3',
							colwidth: '1*'
						}
					],
					[
						'ns2:colspec',
						{
							colname: 'column-3',
							colnum: '4',
							colwidth: '1*'
						}
					],
					[
						'ns2:thead',
						[
							'ns2:row',
							['ns2:entry', { colname: 'column-0' }],
							['ns2:entry', { colname: 'column-1' }],
							['ns2:entry', { colname: 'column-2' }],
							['ns2:entry', { colname: 'column-3' }]
						]
					],
					[
						'ns2:tbody',
						[
							'ns2:row',
							['ns2:entry', { colname: 'column-0' }],
							['ns2:entry', { colname: 'column-1' }],
							['ns2:entry', { colname: 'column-2' }],
							['ns2:entry', { colname: 'column-3' }]
						],
						[
							'ns2:row',
							['ns2:entry', { colname: 'column-0' }],
							['ns2:entry', { colname: 'column-1' }],
							['ns2:entry', { colname: 'column-2' }],
							['ns2:entry', { colname: 'column-3' }]
						],
						[
							'ns2:row',
							['ns2:entry', { colname: 'column-0' }],
							['ns2:entry', { colname: 'column-1' }],
							['ns2:entry', { colname: 'column-2' }],
							['ns2:entry', { colname: 'column-3' }]
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
							'<colspec colname="column-0" colnum="1" colwidth="1*" /><colspec colname="column-1" colnum="2" colwidth="1*" /><colspec colname="column-2" colnum="3" colwidth="1*" /><colspec colname="column-3" colnum="4" colwidth="1*" />',
							'<thead><row><entry colname="column-0" /><entry colname="column-1" /><entry colname="column-2" /><entry colname="column-3" /></row></thead>',
							'<tbody>',
							'<row><entry colname="column-0" /><entry colname="column-1" /><entry colname="column-2" /><entry colname="column-3" /></row>',
							'<row><entry colname="column-0" /><entry colname="column-1" /><entry colname="column-2" /><entry colname="column-3" /></row>',
							'<row><entry colname="column-0" /><entry colname="column-1" /><entry colname="column-2" /><entry colname="column-3" /></row>',
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

	describe('Non-default names and namespaces', () => {
		it('can serialize a 4x4 table with non-default names and namespaces', () => {
			namespaceManager.addNamespace('nstable', 'http://example.com/nstable');
			namespaceManager.addNamespace('nstgroup', 'http://example.com/nstgroup');
			namespaceManager.addNamespace('nsentry', 'http://example.com/nsentry');
			namespaceManager.addNamespace('nscolspec', 'http://example.com/nscolspec');
			namespaceManager.addNamespace('nsrow', 'http://example.com/nsrow');
			namespaceManager.addNamespace('nstbody', 'http://example.com/nstbody');
			namespaceManager.addNamespace('nsthead', 'http://example.com/nsthead');

			const mtableOptions = {
				table: {
					localName: 'mtable',
					namespaceURI: 'http://example.com/nstable'
				},
				tgroup: {
					localName: 'mtgroup',
					namespaceURI: 'http://example.com/nstgroup'
				},
				entry: {
					localName: 'mentry',
					namespaceURI: 'http://example.com/nsentry',
					defaultTextContainer: 'p'
				},

				align: {
					localName: 'malign',
					leftValue: 'mleft',
					rightValue: 'mright',
					centerValue: 'mcenter',
					justifyValue: 'mjustify'
				},

				colname: {
					localName: 'mcolname'
				},

				colnum: { localName: 'mcolnum' },

				cols: { localName: 'mcols' },

				colsep: { localName: 'mcolsep' },

				colspec: {
					localName: 'mcolspec',
					namespaceURI: 'http://example.com/nscolspec'
				},

				colwidth: { localName: 'mcolwidth' },

				frame: { localName: 'mframe', allValue: 'mall', noneValue: 'mnone' },

				morerows: { localName: 'mmorerows' },

				nameend: {
					localName: 'mnameend'
				},

				namest: {
					localName: 'mnamest'
				},

				row: {
					localName: 'mrow',
					namespaceURI: 'http://example.com/nsrow'
				},

				rowsep: { localName: 'mrowsep' },

				tbody: {
					localName: 'mtbody',
					namespaceURI: 'http://example.com/nstbody'
				},

				thead: {
					localName: 'mthead',
					namespaceURI: 'http://example.com/nsthead'
				},

				valign: {
					localName: 'mvalign',
					topValue: 'mtop',
					middleValue: 'mmiddle',
					bottomValue: 'mbottom'
				},

				yesOrNo: {
					yesValue: 'm1',
					noValue: 'm0'
				}
			};

			const tableDefinition = new CalsTableDefinition(mtableOptions);
			const createTable = tableDefinition.getTableGridModelBuilder();
			const tableGridModel = createTable(4, 4, true, documentNode, 'ns2:entry');

			const tableNodeWithNamespace = documentNode.createElementNS(
				'http://example.com/nstable',
				'nstable:mtable'
			);
			const tgroupNodeWithNamespace = documentNode.createElementNS(
				'http://example.com/nstgroup',
				'nstgroup:mtgroup'
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
			indicesManager.getIndexSet().commitMerge();
			chai.assert.deepEqual(jsonMLMapper.serialize(tableNodeWithNamespace), [
				'nstable:mtable',
				{ mframe: 'mall' },
				[
					'nstgroup:mtgroup',
					{ mcols: '4' },
					[
						'nscolspec:mcolspec',
						{
							mcolname: 'column-0',
							mcolnum: '1',
							mcolwidth: '1*'
						}
					],
					[
						'nscolspec:mcolspec',
						{
							mcolname: 'column-1',
							mcolnum: '2',
							mcolwidth: '1*'
						}
					],
					[
						'nscolspec:mcolspec',
						{
							mcolname: 'column-2',
							mcolnum: '3',
							mcolwidth: '1*'
						}
					],
					[
						'nscolspec:mcolspec',
						{
							mcolname: 'column-3',
							mcolnum: '4',
							mcolwidth: '1*'
						}
					],
					[
						'nsthead:mthead',
						[
							'nsrow:mrow',
							['nsentry:mentry', { mcolname: 'column-0' }],
							['nsentry:mentry', { mcolname: 'column-1' }],
							['nsentry:mentry', { mcolname: 'column-2' }],
							['nsentry:mentry', { mcolname: 'column-3' }]
						]
					],
					[
						'nstbody:mtbody',
						[
							'nsrow:mrow',
							['nsentry:mentry', { mcolname: 'column-0' }],
							['nsentry:mentry', { mcolname: 'column-1' }],
							['nsentry:mentry', { mcolname: 'column-2' }],
							['nsentry:mentry', { mcolname: 'column-3' }]
						],
						[
							'nsrow:mrow',
							['nsentry:mentry', { mcolname: 'column-0' }],
							['nsentry:mentry', { mcolname: 'column-1' }],
							['nsentry:mentry', { mcolname: 'column-2' }],
							['nsentry:mentry', { mcolname: 'column-3' }]
						],
						[
							'nsrow:mrow',
							['nsentry:mentry', { mcolname: 'column-0' }],
							['nsentry:mentry', { mcolname: 'column-1' }],
							['nsentry:mentry', { mcolname: 'column-2' }],
							['nsentry:mentry', { mcolname: 'column-3' }]
						]
					]
				]
			]);

			chai.assert.isTrue(
				evaluateXPathToBoolean('deep-equal($a, $b)', null, blueprint, {
					a: tableNodeWithNamespace,
					b: new DOMParser().parseFromString(
						[
							'<mtable mframe="mall" xmlns="http://example.com/nstable">',
							'<mtgroup mcols="4" xmlns="http://example.com/nstgroup">',
							'<mcolspec mcolname="column-0" mcolnum="1" mcolwidth="1*" xmlns="http://example.com/nscolspec" />',
							'<mcolspec mcolname="column-1" mcolnum="2" mcolwidth="1*" xmlns="http://example.com/nscolspec" />',
							'<mcolspec mcolname="column-2" mcolnum="3" mcolwidth="1*" xmlns="http://example.com/nscolspec" />',
							'<mcolspec mcolname="column-3" mcolnum="4" mcolwidth="1*" xmlns="http://example.com/nscolspec" />',
							'<mthead xmlns="http://example.com/nsthead" >',
							'<mrow xmlns="http://example.com/nsrow" >',
							'<mentry mcolname="column-0" xmlns="http://example.com/nsentry" />',
							'<mentry mcolname="column-1" xmlns="http://example.com/nsentry" />',
							'<mentry mcolname="column-2" xmlns="http://example.com/nsentry" />',
							'<mentry mcolname="column-3" xmlns="http://example.com/nsentry" />',
							'</mrow>',
							'</mthead>',
							'<mtbody xmlns="http://example.com/nstbody">',
							'<mrow xmlns="http://example.com/nsrow" >',
							'<mentry mcolname="column-0" xmlns="http://example.com/nsentry" />',
							'<mentry mcolname="column-1" xmlns="http://example.com/nsentry" />',
							'<mentry mcolname="column-2" xmlns="http://example.com/nsentry" />',
							'<mentry mcolname="column-3" xmlns="http://example.com/nsentry" />',
							'</mrow>',
							'<mrow xmlns="http://example.com/nsrow" >',
							'<mentry mcolname="column-0" xmlns="http://example.com/nsentry" />',
							'<mentry mcolname="column-1" xmlns="http://example.com/nsentry" />',
							'<mentry mcolname="column-2" xmlns="http://example.com/nsentry" />',
							'<mentry mcolname="column-3" xmlns="http://example.com/nsentry" />',
							'</mrow>',
							'<mrow xmlns="http://example.com/nsrow" >',
							'<mentry mcolname="column-0" xmlns="http://example.com/nsentry" />',
							'<mentry mcolname="column-1" xmlns="http://example.com/nsentry" />',
							'<mentry mcolname="column-2" xmlns="http://example.com/nsentry" />',
							'<mentry mcolname="column-3" xmlns="http://example.com/nsentry" />',
							'</mrow>',
							'</mtbody>',
							'</mtgroup>',
							'</mtable>'
						].join(''),
						'text/xml'
					).documentElement
				}),
				'deep equal'
			);
		});
	});
});
