import Blueprint from 'fontoxml-blueprints/src/Blueprint.js';
import CoreDocument from 'fontoxml-core/src/Document.js';
import DocumentController from 'fontoxml-core/src/DocumentController.js';
import documentsManager from 'fontoxml-documents/src/documentsManager.js';
import evaluateXPathToFirstNode from 'fontoxml-selectors/src/evaluateXPathToFirstNode.js';
import getNodeId from 'fontoxml-dom-identification/src/getNodeId.js';
import jsonMLMapper from 'fontoxml-dom-utils/src/jsonMLMapper.js';
import indicesManager from 'fontoxml-indices/src/indicesManager.js';
import { getGridModelKey } from 'fontoxml-table-flow/src/indexedTableGridModels.js';
import * as slimdom from 'slimdom';

import CalsTableDefinition from 'fontoxml-table-flow-cals/src/table-definition/CalsTableDefinition.js';
import tableDefinitionManager from 'fontoxml-table-flow/src/tableDefinitionManager.js';
import toggleCellBorder from 'fontoxml-table-flow-cals/src/custom-mutations/toggleCellBorder.js';

describe('toggleCellBorder custom mutation', () => {
	let documentNode;
	let coreDocument;
	let blueprint;
	let tableDefinition;
	let documentId;

	beforeEach(async () => {
		documentNode = new slimdom.Document();
		coreDocument = new CoreDocument(documentNode);
		const documentController = new DocumentController(coreDocument);
		documentId = await documentsManager.addDocument({}, documentController);

		blueprint = new Blueprint(coreDocument.dom);
		tableDefinition = new CalsTableDefinition({
			table: {
				localName: 'table',
				namespaceURI: ''
			},
			tgroup: {
				namespaceURI: ''
			}
		});
		tableDefinitionManager
			.getTableDefinitions()
			.forEach(def => tableDefinitionManager.removeTableDefinition(def));
		tableDefinitionManager.addTableDefinition(tableDefinition);
	});
	afterEach(() => {
		blueprint.destroy();
		tableDefinitionManager.removeTableDefinition(tableDefinition);
		documentsManager.removeDocument(documentId);
	});

	const threeByThreeTable = [
		'table',
		[
			'tgroup',
			{ cols: '3' },
			[
				'colspec',
				{ colname: 'column-0', colnum: '1', colwidth: '1*', colsep: '0', rowsep: '0' }
			],
			[
				'colspec',
				{ colname: 'column-1', colnum: '2', colwidth: '1*', colsep: '0', rowsep: '0' }
			],
			[
				'colspec',
				{ colname: 'column-2', colnum: '3', colwidth: '1*', colsep: '0', rowsep: '0' }
			],
			[
				'tbody',
				[
					'row',
					['entry', { colsep: '0', rowsep: '0', colname: 'column-0' }],
					['entry', { colsep: '0', rowsep: '0', colname: 'column-1' }],
					['entry', { colsep: '0', rowsep: '0', colname: 'column-2' }]
				],
				[
					'row',
					['entry', { colsep: '0', rowsep: '0', colname: 'column-0' }],
					['entry', { colsep: '0', rowsep: '0', colname: 'column-1', id: 'center' }],
					['entry', { colsep: '0', rowsep: '0', colname: 'column-2' }]
				],
				[
					'row',
					['entry', { colsep: '0', rowsep: '0', colname: 'column-0' }],
					['entry', { colsep: '0', rowsep: '0', colname: 'column-1' }],
					['entry', { colsep: '0', rowsep: '0', colname: 'column-2' }]
				]
			]
		]
	];

	describe('setting borders', () => {
		it('can set the top border on the middle cell in a 3x3 table', () => {
			coreDocument.dom.mutate(() => jsonMLMapper.parse(threeByThreeTable, documentNode));

			const cellNodeId = getNodeId(
				evaluateXPathToFirstNode('//entry[@id="center"]', documentNode, blueprint)
			);

			blueprint.beginOverlay();
			toggleCellBorder(
				{
					cellNodeIds: [cellNodeId],
					top: true
				},
				blueprint
			);
			blueprint.applyOverlay();
			blueprint.realize();
			indicesManager.getIndexSet().commitMerge();

			chai.assert.deepEqual(jsonMLMapper.serialize(documentNode.firstChild), [
				'table',
				[
					'tgroup',
					{ cols: '3' },
					[
						'colspec',
						{
							colname: 'column-0',
							colnum: '1',
							colwidth: '1*',
							colsep: '0',
							rowsep: '0'
						}
					],
					[
						'colspec',
						{
							colname: 'column-1',
							colnum: '2',
							colwidth: '1*',
							colsep: '0',
							rowsep: '0'
						}
					],
					[
						'colspec',
						{
							colname: 'column-2',
							colnum: '3',
							colwidth: '1*',
							colsep: '0',
							rowsep: '0'
						}
					],
					[
						'tbody',
						[
							'row',
							['entry', { colsep: '0', rowsep: '0', colname: 'column-0' }],
							['entry', { colsep: '0', rowsep: '1', colname: 'column-1' }],
							['entry', { colsep: '0', rowsep: '0', colname: 'column-2' }]
						],
						[
							'row',
							['entry', { colsep: '0', rowsep: '0', colname: 'column-0' }],
							[
								'entry',
								{ colsep: '0', rowsep: '0', colname: 'column-1', id: 'center' }
							],
							['entry', { colsep: '0', rowsep: '0', colname: 'column-2' }]
						],
						[
							'row',
							['entry', { colsep: '0', rowsep: '0', colname: 'column-0' }],
							['entry', { colsep: '0', rowsep: '0', colname: 'column-1' }],
							['entry', { colsep: '0', rowsep: '0', colname: 'column-2' }]
						]
					]
				]
			]);
		});

		it('can set the right border on the middle cell in a 3x3 table', () => {
			coreDocument.dom.mutate(() => jsonMLMapper.parse(threeByThreeTable, documentNode));

			const cellNodeId = getNodeId(
				evaluateXPathToFirstNode('//entry[@id="center"]', documentNode, blueprint)
			);

			blueprint.beginOverlay();
			toggleCellBorder(
				{
					cellNodeIds: [cellNodeId],
					right: true
				},
				blueprint
			);
			blueprint.applyOverlay();
			blueprint.realize();
			indicesManager.getIndexSet().commitMerge();

			chai.assert.deepEqual(jsonMLMapper.serialize(documentNode.firstChild), [
				'table',
				[
					'tgroup',
					{ cols: '3' },
					[
						'colspec',
						{
							colname: 'column-0',
							colnum: '1',
							colwidth: '1*',
							colsep: '0',
							rowsep: '0'
						}
					],
					[
						'colspec',
						{
							colname: 'column-1',
							colnum: '2',
							colwidth: '1*',
							colsep: '0',
							rowsep: '0'
						}
					],
					[
						'colspec',
						{
							colname: 'column-2',
							colnum: '3',
							colwidth: '1*',
							colsep: '0',
							rowsep: '0'
						}
					],
					[
						'tbody',
						[
							'row',
							['entry', { colsep: '0', rowsep: '0', colname: 'column-0' }],
							['entry', { colsep: '0', rowsep: '0', colname: 'column-1' }],
							['entry', { colsep: '0', rowsep: '0', colname: 'column-2' }]
						],
						[
							'row',
							['entry', { colsep: '0', rowsep: '0', colname: 'column-0' }],
							[
								'entry',
								{ colsep: '1', rowsep: '0', colname: 'column-1', id: 'center' }
							],
							['entry', { colsep: '0', rowsep: '0', colname: 'column-2' }]
						],
						[
							'row',
							['entry', { colsep: '0', rowsep: '0', colname: 'column-0' }],
							['entry', { colsep: '0', rowsep: '0', colname: 'column-1' }],
							['entry', { colsep: '0', rowsep: '0', colname: 'column-2' }]
						]
					]
				]
			]);
		});

		it('can set the bottom border on the middle cell in a 3x3 table', () => {
			coreDocument.dom.mutate(() => jsonMLMapper.parse(threeByThreeTable, documentNode));

			const cellNodeId = getNodeId(
				evaluateXPathToFirstNode('//entry[@id="center"]', documentNode, blueprint)
			);

			blueprint.beginOverlay();
			toggleCellBorder(
				{
					cellNodeIds: [cellNodeId],
					bottom: true
				},
				blueprint
			);
			blueprint.applyOverlay();
			blueprint.realize();
			indicesManager.getIndexSet().commitMerge();

			chai.assert.deepEqual(jsonMLMapper.serialize(documentNode.firstChild), [
				'table',
				[
					'tgroup',
					{ cols: '3' },
					[
						'colspec',
						{
							colname: 'column-0',
							colnum: '1',
							colwidth: '1*',
							colsep: '0',
							rowsep: '0'
						}
					],
					[
						'colspec',
						{
							colname: 'column-1',
							colnum: '2',
							colwidth: '1*',
							colsep: '0',
							rowsep: '0'
						}
					],
					[
						'colspec',
						{
							colname: 'column-2',
							colnum: '3',
							colwidth: '1*',
							colsep: '0',
							rowsep: '0'
						}
					],
					[
						'tbody',
						[
							'row',
							['entry', { colsep: '0', rowsep: '0', colname: 'column-0' }],
							['entry', { colsep: '0', rowsep: '0', colname: 'column-1' }],
							['entry', { colsep: '0', rowsep: '0', colname: 'column-2' }]
						],
						[
							'row',
							['entry', { colsep: '0', rowsep: '0', colname: 'column-0' }],
							[
								'entry',
								{ colsep: '0', rowsep: '1', colname: 'column-1', id: 'center' }
							],
							['entry', { colsep: '0', rowsep: '0', colname: 'column-2' }]
						],
						[
							'row',
							['entry', { colsep: '0', rowsep: '0', colname: 'column-0' }],
							['entry', { colsep: '0', rowsep: '0', colname: 'column-1' }],
							['entry', { colsep: '0', rowsep: '0', colname: 'column-2' }]
						]
					]
				]
			]);
		});

		it('can set the left border on the middle cell in a 3x3 table', () => {
			coreDocument.dom.mutate(() => jsonMLMapper.parse(threeByThreeTable, documentNode));

			const cellNodeId = getNodeId(
				evaluateXPathToFirstNode('//entry[@id="center"]', documentNode, blueprint)
			);

			blueprint.beginOverlay();
			toggleCellBorder(
				{
					cellNodeIds: [cellNodeId],
					left: true
				},
				blueprint
			);
			blueprint.applyOverlay();
			blueprint.realize();
			indicesManager.getIndexSet().commitMerge();

			chai.assert.deepEqual(jsonMLMapper.serialize(documentNode.firstChild), [
				'table',
				[
					'tgroup',
					{ cols: '3' },
					[
						'colspec',
						{
							colname: 'column-0',
							colnum: '1',
							colwidth: '1*',
							colsep: '0',
							rowsep: '0'
						}
					],
					[
						'colspec',
						{
							colname: 'column-1',
							colnum: '2',
							colwidth: '1*',
							colsep: '0',
							rowsep: '0'
						}
					],
					[
						'colspec',
						{
							colname: 'column-2',
							colnum: '3',
							colwidth: '1*',
							colsep: '0',
							rowsep: '0'
						}
					],
					[
						'tbody',
						[
							'row',
							['entry', { colsep: '0', rowsep: '0', colname: 'column-0' }],
							['entry', { colsep: '0', rowsep: '0', colname: 'column-1' }],
							['entry', { colsep: '0', rowsep: '0', colname: 'column-2' }]
						],
						[
							'row',
							['entry', { colsep: '1', rowsep: '0', colname: 'column-0' }],
							[
								'entry',
								{ colsep: '0', rowsep: '0', colname: 'column-1', id: 'center' }
							],
							['entry', { colsep: '0', rowsep: '0', colname: 'column-2' }]
						],
						[
							'row',
							['entry', { colsep: '0', rowsep: '0', colname: 'column-0' }],
							['entry', { colsep: '0', rowsep: '0', colname: 'column-1' }],
							['entry', { colsep: '0', rowsep: '0', colname: 'column-2' }]
						]
					]
				]
			]);
		});

		it('can set all border on the middle cell in a 3x3 table', () => {
			coreDocument.dom.mutate(() => jsonMLMapper.parse(threeByThreeTable, documentNode));

			const cellNodeId = getNodeId(
				evaluateXPathToFirstNode('//entry[@id="center"]', documentNode, blueprint)
			);

			blueprint.beginOverlay();
			toggleCellBorder(
				{
					cellNodeIds: [cellNodeId],
					bottom: true,
					left: true,
					right: true,
					top: true
				},
				blueprint
			);
			blueprint.applyOverlay();
			blueprint.realize();
			indicesManager.getIndexSet().commitMerge();

			chai.assert.deepEqual(jsonMLMapper.serialize(documentNode.firstChild), [
				'table',
				[
					'tgroup',
					{ cols: '3' },
					[
						'colspec',
						{
							colname: 'column-0',
							colnum: '1',
							colwidth: '1*',
							colsep: '0',
							rowsep: '0'
						}
					],
					[
						'colspec',
						{
							colname: 'column-1',
							colnum: '2',
							colwidth: '1*',
							colsep: '0',
							rowsep: '0'
						}
					],
					[
						'colspec',
						{
							colname: 'column-2',
							colnum: '3',
							colwidth: '1*',
							colsep: '0',
							rowsep: '0'
						}
					],
					[
						'tbody',
						[
							'row',
							['entry', { colsep: '0', rowsep: '0', colname: 'column-0' }],
							['entry', { colsep: '0', rowsep: '1', colname: 'column-1' }],
							['entry', { colsep: '0', rowsep: '0', colname: 'column-2' }]
						],
						[
							'row',
							['entry', { colsep: '1', rowsep: '0', colname: 'column-0' }],
							[
								'entry',
								{ colsep: '1', rowsep: '1', colname: 'column-1', id: 'center' }
							],
							['entry', { colsep: '0', rowsep: '0', colname: 'column-2' }]
						],
						[
							'row',
							['entry', { colsep: '0', rowsep: '0', colname: 'column-0' }],
							['entry', { colsep: '0', rowsep: '0', colname: 'column-1' }],
							['entry', { colsep: '0', rowsep: '0', colname: 'column-2' }]
						]
					]
				]
			]);
		});
	});

	const threeByThreeTableWithBorders = [
		'table',
		[
			'tgroup',
			{ cols: '3' },
			[
				'colspec',
				{ colname: 'column-0', colnum: '1', colwidth: '1*', colsep: '0', rowsep: '0' }
			],
			[
				'colspec',
				{ colname: 'column-1', colnum: '2', colwidth: '1*', colsep: '0', rowsep: '0' }
			],
			[
				'colspec',
				{ colname: 'column-2', colnum: '3', colwidth: '1*', colsep: '0', rowsep: '0' }
			],
			[
				'tbody',
				[
					'row',
					['entry', { colsep: '0', rowsep: '0', colname: 'column-0' }],
					['entry', { colsep: '0', rowsep: '1', colname: 'column-1' }],
					['entry', { colsep: '0', rowsep: '0', colname: 'column-2' }]
				],
				[
					'row',
					['entry', { colsep: '1', rowsep: '0', colname: 'column-0' }],
					['entry', { colsep: '1', rowsep: '1', colname: 'column-1', id: 'center' }],
					['entry', { colsep: '0', rowsep: '0', colname: 'column-2' }]
				],
				[
					'row',
					['entry', { colsep: '0', rowsep: '0', colname: 'column-0' }],
					['entry', { colsep: '0', rowsep: '0', colname: 'column-1' }],
					['entry', { colsep: '0', rowsep: '0', colname: 'column-2' }]
				]
			]
		]
	];

	describe('unsetting borders', () => {
		it('can unset the top border on the middle cell in a 3x3 table', () => {
			coreDocument.dom.mutate(() =>
				jsonMLMapper.parse(threeByThreeTableWithBorders, documentNode)
			);

			const tableNode = evaluateXPathToFirstNode('//table', documentNode, blueprint);
			getGridModelKey(tableDefinition, tableNode, blueprint);

			const cellNodeId = getNodeId(
				evaluateXPathToFirstNode('//entry[@id="center"]', documentNode, blueprint)
			);

			blueprint.beginOverlay();
			toggleCellBorder(
				{
					cellNodeIds: [cellNodeId],
					top: false
				},
				blueprint
			);
			blueprint.applyOverlay();
			blueprint.realize();
			indicesManager.getIndexSet().commitMerge();

			chai.assert.deepEqual(jsonMLMapper.serialize(documentNode.firstChild), [
				'table',
				[
					'tgroup',
					{ cols: '3' },
					[
						'colspec',
						{
							colname: 'column-0',
							colnum: '1',
							colwidth: '1*',
							colsep: '0',
							rowsep: '0'
						}
					],
					[
						'colspec',
						{
							colname: 'column-1',
							colnum: '2',
							colwidth: '1*',
							colsep: '0',
							rowsep: '0'
						}
					],
					[
						'colspec',
						{
							colname: 'column-2',
							colnum: '3',
							colwidth: '1*',
							colsep: '0',
							rowsep: '0'
						}
					],
					[
						'tbody',
						[
							'row',
							['entry', { colsep: '0', rowsep: '0', colname: 'column-0' }],
							['entry', { colsep: '0', rowsep: '0', colname: 'column-1' }],
							['entry', { colsep: '0', rowsep: '0', colname: 'column-2' }]
						],
						[
							'row',
							['entry', { colsep: '1', rowsep: '0', colname: 'column-0' }],
							[
								'entry',
								{ colsep: '1', rowsep: '1', colname: 'column-1', id: 'center' }
							],
							['entry', { colsep: '0', rowsep: '0', colname: 'column-2' }]
						],
						[
							'row',
							['entry', { colsep: '0', rowsep: '0', colname: 'column-0' }],
							['entry', { colsep: '0', rowsep: '0', colname: 'column-1' }],
							['entry', { colsep: '0', rowsep: '0', colname: 'column-2' }]
						]
					]
				]
			]);
		});

		it('can unset the right border on the middle cell in a 3x3 table', () => {
			coreDocument.dom.mutate(() =>
				jsonMLMapper.parse(threeByThreeTableWithBorders, documentNode)
			);

			const tableNode = evaluateXPathToFirstNode('//table', documentNode, blueprint);
			getGridModelKey(tableDefinition, tableNode, blueprint);

			const cellNodeId = getNodeId(
				evaluateXPathToFirstNode('//entry[@id="center"]', documentNode, blueprint)
			);

			blueprint.beginOverlay();
			toggleCellBorder(
				{
					cellNodeIds: [cellNodeId],
					right: false
				},
				blueprint
			);
			blueprint.applyOverlay();
			blueprint.realize();
			indicesManager.getIndexSet().commitMerge();

			chai.assert.deepEqual(jsonMLMapper.serialize(documentNode.firstChild), [
				'table',
				[
					'tgroup',
					{ cols: '3' },
					[
						'colspec',
						{
							colname: 'column-0',
							colnum: '1',
							colwidth: '1*',
							colsep: '0',
							rowsep: '0'
						}
					],
					[
						'colspec',
						{
							colname: 'column-1',
							colnum: '2',
							colwidth: '1*',
							colsep: '0',
							rowsep: '0'
						}
					],
					[
						'colspec',
						{
							colname: 'column-2',
							colnum: '3',
							colwidth: '1*',
							colsep: '0',
							rowsep: '0'
						}
					],
					[
						'tbody',
						[
							'row',
							['entry', { colsep: '0', rowsep: '0', colname: 'column-0' }],
							['entry', { colsep: '0', rowsep: '1', colname: 'column-1' }],
							['entry', { colsep: '0', rowsep: '0', colname: 'column-2' }]
						],
						[
							'row',
							['entry', { colsep: '1', rowsep: '0', colname: 'column-0' }],
							[
								'entry',
								{ colsep: '0', rowsep: '1', colname: 'column-1', id: 'center' }
							],
							['entry', { colsep: '0', rowsep: '0', colname: 'column-2' }]
						],
						[
							'row',
							['entry', { colsep: '0', rowsep: '0', colname: 'column-0' }],
							['entry', { colsep: '0', rowsep: '0', colname: 'column-1' }],
							['entry', { colsep: '0', rowsep: '0', colname: 'column-2' }]
						]
					]
				]
			]);
		});

		it('can unset the bottom border on the middle cell in a 3x3 table', () => {
			coreDocument.dom.mutate(() =>
				jsonMLMapper.parse(threeByThreeTableWithBorders, documentNode)
			);

			const tableNode = evaluateXPathToFirstNode('//table', documentNode, blueprint);
			getGridModelKey(tableDefinition, tableNode, blueprint);

			const cellNodeId = getNodeId(
				evaluateXPathToFirstNode('//entry[@id="center"]', documentNode, blueprint)
			);

			blueprint.beginOverlay();
			toggleCellBorder(
				{
					cellNodeIds: [cellNodeId],
					bottom: false
				},
				blueprint
			);
			blueprint.applyOverlay();
			blueprint.realize();
			indicesManager.getIndexSet().commitMerge();

			chai.assert.deepEqual(jsonMLMapper.serialize(documentNode.firstChild), [
				'table',
				[
					'tgroup',
					{ cols: '3' },
					[
						'colspec',
						{
							colname: 'column-0',
							colnum: '1',
							colwidth: '1*',
							colsep: '0',
							rowsep: '0'
						}
					],
					[
						'colspec',
						{
							colname: 'column-1',
							colnum: '2',
							colwidth: '1*',
							colsep: '0',
							rowsep: '0'
						}
					],
					[
						'colspec',
						{
							colname: 'column-2',
							colnum: '3',
							colwidth: '1*',
							colsep: '0',
							rowsep: '0'
						}
					],
					[
						'tbody',
						[
							'row',
							['entry', { colsep: '0', rowsep: '0', colname: 'column-0' }],
							['entry', { colsep: '0', rowsep: '1', colname: 'column-1' }],
							['entry', { colsep: '0', rowsep: '0', colname: 'column-2' }]
						],
						[
							'row',
							['entry', { colsep: '1', rowsep: '0', colname: 'column-0' }],
							[
								'entry',
								{ colsep: '1', rowsep: '0', colname: 'column-1', id: 'center' }
							],
							['entry', { colsep: '0', rowsep: '0', colname: 'column-2' }]
						],
						[
							'row',
							['entry', { colsep: '0', rowsep: '0', colname: 'column-0' }],
							['entry', { colsep: '0', rowsep: '0', colname: 'column-1' }],
							['entry', { colsep: '0', rowsep: '0', colname: 'column-2' }]
						]
					]
				]
			]);
		});

		it('can unset the left border on the middle cell in a 3x3 table', () => {
			coreDocument.dom.mutate(() =>
				jsonMLMapper.parse(threeByThreeTableWithBorders, documentNode)
			);

			const cellNodeId = getNodeId(
				evaluateXPathToFirstNode('//entry[@id="center"]', documentNode, blueprint)
			);

			blueprint.beginOverlay();
			toggleCellBorder(
				{
					cellNodeIds: [cellNodeId],
					left: false
				},
				blueprint
			);
			blueprint.applyOverlay();
			blueprint.realize();
			indicesManager.getIndexSet().commitMerge();

			chai.assert.deepEqual(jsonMLMapper.serialize(documentNode.firstChild), [
				'table',
				[
					'tgroup',
					{ cols: '3' },
					[
						'colspec',
						{
							colname: 'column-0',
							colnum: '1',
							colwidth: '1*',
							colsep: '0',
							rowsep: '0'
						}
					],
					[
						'colspec',
						{
							colname: 'column-1',
							colnum: '2',
							colwidth: '1*',
							colsep: '0',
							rowsep: '0'
						}
					],
					[
						'colspec',
						{
							colname: 'column-2',
							colnum: '3',
							colwidth: '1*',
							colsep: '0',
							rowsep: '0'
						}
					],
					[
						'tbody',
						[
							'row',
							['entry', { colsep: '0', rowsep: '0', colname: 'column-0' }],
							['entry', { colsep: '0', rowsep: '1', colname: 'column-1' }],
							['entry', { colsep: '0', rowsep: '0', colname: 'column-2' }]
						],
						[
							'row',
							['entry', { colsep: '0', rowsep: '0', colname: 'column-0' }],
							[
								'entry',
								{ colsep: '1', rowsep: '1', colname: 'column-1', id: 'center' }
							],
							['entry', { colsep: '0', rowsep: '0', colname: 'column-2' }]
						],
						[
							'row',
							['entry', { colsep: '0', rowsep: '0', colname: 'column-0' }],
							['entry', { colsep: '0', rowsep: '0', colname: 'column-1' }],
							['entry', { colsep: '0', rowsep: '0', colname: 'column-2' }]
						]
					]
				]
			]);
		});

		it('can unset all border on the middle cell in a 3x3 table', () => {
			coreDocument.dom.mutate(() =>
				jsonMLMapper.parse(threeByThreeTableWithBorders, documentNode)
			);

			const tableNode = evaluateXPathToFirstNode('//table', documentNode, blueprint);
			getGridModelKey(tableDefinition, tableNode, blueprint);

			const cellNodeId = getNodeId(
				evaluateXPathToFirstNode('//entry[@id="center"]', documentNode, blueprint)
			);

			blueprint.beginOverlay();
			toggleCellBorder(
				{
					cellNodeIds: [cellNodeId],
					bottom: false,
					left: false,
					right: false,
					top: false
				},
				blueprint
			);
			blueprint.applyOverlay();
			blueprint.realize();
			indicesManager.getIndexSet().commitMerge();

			chai.assert.deepEqual(jsonMLMapper.serialize(documentNode.firstChild), [
				'table',
				[
					'tgroup',
					{ cols: '3' },
					[
						'colspec',
						{
							colname: 'column-0',
							colnum: '1',
							colwidth: '1*',
							colsep: '0',
							rowsep: '0'
						}
					],
					[
						'colspec',
						{
							colname: 'column-1',
							colnum: '2',
							colwidth: '1*',
							colsep: '0',
							rowsep: '0'
						}
					],
					[
						'colspec',
						{
							colname: 'column-2',
							colnum: '3',
							colwidth: '1*',
							colsep: '0',
							rowsep: '0'
						}
					],
					[
						'tbody',
						[
							'row',
							['entry', { colsep: '0', rowsep: '0', colname: 'column-0' }],
							['entry', { colsep: '0', rowsep: '0', colname: 'column-1' }],
							['entry', { colsep: '0', rowsep: '0', colname: 'column-2' }]
						],
						[
							'row',
							['entry', { colsep: '0', rowsep: '0', colname: 'column-0' }],
							[
								'entry',
								{ colsep: '0', rowsep: '0', colname: 'column-1', id: 'center' }
							],
							['entry', { colsep: '0', rowsep: '0', colname: 'column-2' }]
						],
						[
							'row',
							['entry', { colsep: '0', rowsep: '0', colname: 'column-0' }],
							['entry', { colsep: '0', rowsep: '0', colname: 'column-1' }],
							['entry', { colsep: '0', rowsep: '0', colname: 'column-2' }]
						]
					]
				]
			]);
		});
	});
});
