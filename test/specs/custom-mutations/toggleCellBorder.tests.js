import Blueprint from 'fontoxml-blueprints/Blueprint';
import core from 'fontoxml-core';
import documentsManager from 'fontoxml-documents/documentsManager';
import evaluateXPathToFirstNode from 'fontoxml-selectors/evaluateXPathToFirstNode';
import getNodeId from 'fontoxml-dom-identification/getNodeId';
import jsonMLMapper from 'fontoxml-dom-utils/jsonMLMapper';
import indicesManager from 'fontoxml-indices/indicesManager';
import { getGridModelKey } from 'fontoxml-table-flow/src/indexedTableGridModels.js';
import * as slimdom from 'slimdom';

import CalsTableDefinition from 'fontoxml-table-flow-cals/table-definition/CalsTableDefinition';
import tableDefinitionManager from 'fontoxml-table-flow/tableDefinitionManager';
import toggleCellBorder from 'fontoxml-table-flow-cals/custom-mutations/toggleCellBorder';

const CoreDocument = core.Document;
const DocumentController = core.DocumentController;

describe('toggleCellBorder custom mutation', () => {
	let documentNode;
	let coreDocument;
	let blueprint;
	let tableDefinition;

	beforeEach(() => {
		documentNode = new slimdom.Document();
		coreDocument = new CoreDocument(documentNode);
		const documentController = new DocumentController(coreDocument);
		documentsManager.addDocument({}, documentController);

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
		tableDefinitionManager.addTableDefinition(tableDefinition);
	});

	afterEach(() => {
		// The CacheInvalidationHook is not registered so we need to commit merge after each test.
		indicesManager.getIndex('callback-index').commitMerge();
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
<<<<<<< Updated upstream

			const tableNode = evaluateXPathToFirstNode('//table', documentNode, blueprint);
			getGridModelKey(tableDefinition, tableNode);
=======
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream

			const tableNode = evaluateXPathToFirstNode('//table', documentNode, blueprint);
			getGridModelKey(tableDefinition, tableNode);
=======
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream

			const tableNode = evaluateXPathToFirstNode('//table', documentNode, blueprint);
			getGridModelKey(tableDefinition, tableNode);
=======
>>>>>>> Stashed changes

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
					left: true
				},
				blueprint
			);
			blueprint.applyOverlay();
			blueprint.realize();

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
<<<<<<< Updated upstream

			const tableNode = evaluateXPathToFirstNode('//table', documentNode, blueprint);
			getGridModelKey(tableDefinition, tableNode);
=======
>>>>>>> Stashed changes

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
