import * as slimdom from 'slimdom';

import CustomMutationResult from 'fontoxml-base-flow/src/CustomMutationResult';
import Blueprint from 'fontoxml-blueprints/src/Blueprint';
import CoreDocument from 'fontoxml-core/src/Document';
import DocumentController from 'fontoxml-core/src/DocumentController';
import documentsManager from 'fontoxml-documents/src/documentsManager';
import getNodeId from 'fontoxml-dom-identification/src/getNodeId';
import jsonMLMapper from 'fontoxml-dom-utils/src/jsonMLMapper';
import indicesManager from 'fontoxml-indices/src/indicesManager';
import evaluateXPathToFirstNode from 'fontoxml-selectors/src/evaluateXPathToFirstNode';
import evaluateXPathToNodes from 'fontoxml-selectors/src/evaluateXPathToNodes';
import tableDefinitionManager from 'fontoxml-table-flow/src/tableDefinitionManager';
import toggleCellBorder from 'fontoxml-table-flow-cals/src/custom-mutations/toggleCellBorder';
import CalsTableDefinition from 'fontoxml-table-flow-cals/src/table-definition/CalsTableDefinition';

import registerCustomXPathFunctions from '../utils/registerCustomXPathFunctions';
import TestTableDefinition from '../utils/TestTableDefinition';

registerCustomXPathFunctions();

const threeByThreeTable = [
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
				rowsep: '0',
			},
		],
		[
			'colspec',
			{
				colname: 'column-1',
				colnum: '2',
				colwidth: '1*',
				colsep: '0',
				rowsep: '0',
			},
		],
		[
			'colspec',
			{
				colname: 'column-2',
				colnum: '3',
				colwidth: '1*',
				colsep: '0',
				rowsep: '0',
			},
		],
		[
			'tbody',
			[
				'row',
				['entry', { colsep: '0', rowsep: '0', colname: 'column-0' }],
				['entry', { colsep: '0', rowsep: '0', colname: 'column-1' }],
				['entry', { colsep: '0', rowsep: '0', colname: 'column-2' }],
			],
			[
				'row',
				['entry', { colsep: '0', rowsep: '0', colname: 'column-0' }],
				[
					'entry',
					{
						colsep: '0',
						rowsep: '0',
						colname: 'column-1',
						id: 'center',
					},
				],
				['entry', { colsep: '0', rowsep: '0', colname: 'column-2' }],
			],
			[
				'row',
				['entry', { colsep: '0', rowsep: '0', colname: 'column-0' }],
				['entry', { colsep: '0', rowsep: '0', colname: 'column-1' }],
				['entry', { colsep: '0', rowsep: '0', colname: 'column-2' }],
			],
		],
	],
];

describe('toggleCellBorder custom mutation', () => {
	describe('on a CALS table', () => {
		let documentNode;
		let coreDocument;
		let blueprint;
		let tableDefinition;
		let documentId;

		beforeEach(async () => {
			documentNode = new slimdom.Document();
			coreDocument = new CoreDocument(documentNode);
			const documentController = new DocumentController(coreDocument);
			documentId = await documentsManager.addDocument(
				{},
				documentController
			);

			blueprint = new Blueprint(coreDocument.dom);
			tableDefinition = new CalsTableDefinition({
				table: {
					localName: 'table',
					namespaceURI: '',
				},
				tgroup: {
					namespaceURI: '',
				},
			});
			tableDefinitionManager.getTableDefinitions().forEach((def) => {
				tableDefinitionManager.removeTableDefinition(def);
			});
			tableDefinitionManager.addTableDefinition(tableDefinition);
		});

		afterEach(() => {
			blueprint.destroy();
			tableDefinitionManager.removeTableDefinition(tableDefinition);
			documentsManager.removeDocument(documentId);
		});

		describe('setting borders', () => {
			// case: bottom right
			it('cannot set the right border for the bottom right corner cell', () => {
				coreDocument.dom.mutate(() =>
					jsonMLMapper.parse(threeByThreeTable, documentNode)
				);

				const cellNodeId = getNodeId(
					evaluateXPathToFirstNode(
						'//tbody/row[3]/entry[3]',
						documentNode,
						blueprint
					)
				);

				blueprint.beginOverlay();
				const result = toggleCellBorder(
					{
						cellNodeIds: [cellNodeId],
						right: true,
					},
					blueprint
				);
				blueprint.applyOverlay();
				blueprint.realize();
				indicesManager.getIndexSet().commitMerge();

				chai.assert.deepEqual(
					result,
					CustomMutationResult.notAllowed()
				);
			});
			// case: bottom right
			it('cannot set the bottom border for the bottom right corner cell', () => {
				coreDocument.dom.mutate(() =>
					jsonMLMapper.parse(threeByThreeTable, documentNode)
				);

				const cellNodeId = getNodeId(
					evaluateXPathToFirstNode(
						'//tbody/row[3]/entry[3]',
						documentNode,
						blueprint
					)
				);

				blueprint.beginOverlay();
				const result = toggleCellBorder(
					{
						cellNodeIds: [cellNodeId],
						bottom: true,
					},
					blueprint
				);
				blueprint.applyOverlay();
				blueprint.realize();
				indicesManager.getIndexSet().commitMerge();

				chai.assert.deepEqual(
					result,
					CustomMutationResult.notAllowed()
				);
			});
			// case: bottom left
			it('cannot set the bottom border on the bottom left corner cell', () => {
				coreDocument.dom.mutate(() =>
					jsonMLMapper.parse(threeByThreeTable, documentNode)
				);

				const cellNodeId = getNodeId(
					evaluateXPathToFirstNode(
						'//tbody/row[3]/entry[1]',
						documentNode,
						blueprint
					)
				);

				blueprint.beginOverlay();
				const result = toggleCellBorder(
					{
						cellNodeIds: [cellNodeId],
						bottom: true,
					},
					blueprint
				);
				blueprint.applyOverlay();
				blueprint.realize();
				indicesManager.getIndexSet().commitMerge();

				chai.assert.deepEqual(
					result,
					CustomMutationResult.notAllowed()
				);
			});
			// case: bottom left
			it('cannot set the left border on the bottom left corner cell', () => {
				coreDocument.dom.mutate(() =>
					jsonMLMapper.parse(threeByThreeTable, documentNode)
				);

				const cellNodeId = getNodeId(
					evaluateXPathToFirstNode(
						'//tbody/row[3]/entry[1]',
						documentNode,
						blueprint
					)
				);

				blueprint.beginOverlay();
				const result = toggleCellBorder(
					{
						cellNodeIds: [cellNodeId],
						left: true,
					},
					blueprint
				);
				blueprint.applyOverlay();
				blueprint.realize();
				indicesManager.getIndexSet().commitMerge();

				chai.assert.deepEqual(
					result,
					CustomMutationResult.notAllowed()
				);
			});

			// case: top left
			it('cannot set the top border on the top left corner cell', () => {
				coreDocument.dom.mutate(() =>
					jsonMLMapper.parse(threeByThreeTable, documentNode)
				);

				const cellNodeId = getNodeId(
					evaluateXPathToFirstNode(
						'//tbody/row[1]/entry[1]',
						documentNode,
						blueprint
					)
				);

				blueprint.beginOverlay();
				const result = toggleCellBorder(
					{
						cellNodeIds: [cellNodeId],
						top: true,
					},
					blueprint
				);
				blueprint.applyOverlay();
				blueprint.realize();
				indicesManager.getIndexSet().commitMerge();

				chai.assert.deepEqual(
					result,
					CustomMutationResult.notAllowed()
				);
			});
			// case: top left
			it('cannot set the left border on the top left corner cell', () => {
				coreDocument.dom.mutate(() =>
					jsonMLMapper.parse(threeByThreeTable, documentNode)
				);

				const cellNodeId = getNodeId(
					evaluateXPathToFirstNode(
						'//tbody/row[1]/entry[1]',
						documentNode,
						blueprint
					)
				);

				blueprint.beginOverlay();
				const result = toggleCellBorder(
					{
						cellNodeIds: [cellNodeId],
						left: true,
					},
					blueprint
				);
				blueprint.applyOverlay();
				blueprint.realize();
				indicesManager.getIndexSet().commitMerge();

				chai.assert.deepEqual(
					result,
					CustomMutationResult.notAllowed()
				);
			});
			// case: top right
			it('cannot set the top border on the top right corner cell', () => {
				coreDocument.dom.mutate(() =>
					jsonMLMapper.parse(threeByThreeTable, documentNode)
				);

				const cellNodeId = getNodeId(
					evaluateXPathToFirstNode(
						'//tbody/row[1]/entry[3]',
						documentNode,
						blueprint
					)
				);

				blueprint.beginOverlay();
				const result = toggleCellBorder(
					{
						cellNodeIds: [cellNodeId],
						top: true,
					},
					blueprint
				);
				blueprint.applyOverlay();
				blueprint.realize();
				indicesManager.getIndexSet().commitMerge();

				chai.assert.deepEqual(
					result,
					CustomMutationResult.notAllowed()
				);
			});
			// case: top right
			it('cannot set the right border on the top right corner cell', () => {
				coreDocument.dom.mutate(() =>
					jsonMLMapper.parse(threeByThreeTable, documentNode)
				);

				const cellNodeId = getNodeId(
					evaluateXPathToFirstNode(
						'//tbody/row[1]/entry[3]',
						documentNode,
						blueprint
					)
				);

				blueprint.beginOverlay();
				const result = toggleCellBorder(
					{
						cellNodeIds: [cellNodeId],
						right: true,
					},
					blueprint
				);
				blueprint.applyOverlay();
				blueprint.realize();
				indicesManager.getIndexSet().commitMerge();

				chai.assert.deepEqual(
					result,
					CustomMutationResult.notAllowed()
				);
			});
			// case: bottom middle
			it('cannot set the bottom border on the bottom middle corner cell', () => {
				coreDocument.dom.mutate(() =>
					jsonMLMapper.parse(threeByThreeTable, documentNode)
				);

				const cellNodeId = getNodeId(
					evaluateXPathToFirstNode(
						'//tbody/row[3]/entry[2]',
						documentNode,
						blueprint
					)
				);

				blueprint.beginOverlay();
				const result = toggleCellBorder(
					{
						cellNodeIds: [cellNodeId],
						bottom: true,
					},
					blueprint
				);
				blueprint.applyOverlay();
				blueprint.realize();
				indicesManager.getIndexSet().commitMerge();

				chai.assert.deepEqual(
					result,
					CustomMutationResult.notAllowed()
				);
			});
			// case: top middle
			it('cannot set the top border on the top middle corner cell', () => {
				coreDocument.dom.mutate(() =>
					jsonMLMapper.parse(threeByThreeTable, documentNode)
				);

				const cellNodeId = getNodeId(
					evaluateXPathToFirstNode(
						'//tbody/row[1]/entry[2]',
						documentNode,
						blueprint
					)
				);

				blueprint.beginOverlay();
				const result = toggleCellBorder(
					{
						cellNodeIds: [cellNodeId],
						top: true,
					},
					blueprint
				);
				blueprint.applyOverlay();
				blueprint.realize();
				indicesManager.getIndexSet().commitMerge();

				chai.assert.deepEqual(
					result,
					CustomMutationResult.notAllowed()
				);
			});
			it('can set the top border on the middle cell in a 3x3 table', () => {
				coreDocument.dom.mutate(() =>
					jsonMLMapper.parse(threeByThreeTable, documentNode)
				);

				const cellNodeId = getNodeId(
					evaluateXPathToFirstNode(
						'//entry[@id="center"]',
						documentNode,
						blueprint
					)
				);

				blueprint.beginOverlay();
				toggleCellBorder(
					{
						cellNodeIds: [cellNodeId],
						top: true,
					},
					blueprint
				);
				blueprint.applyOverlay();
				blueprint.realize();
				indicesManager.getIndexSet().commitMerge();

				chai.assert.deepEqual(
					jsonMLMapper.serialize(documentNode.firstChild),
					[
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
									rowsep: '0',
								},
							],
							[
								'colspec',
								{
									colname: 'column-1',
									colnum: '2',
									colwidth: '1*',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'colspec',
								{
									colname: 'column-2',
									colnum: '3',
									colwidth: '1*',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'tbody',
								[
									'row',
									[
										'entry',
										{
											colsep: '0',
											rowsep: '0',
											colname: 'column-0',
										},
									],
									[
										'entry',
										{
											colsep: '0',
											rowsep: '1',
											colname: 'column-1',
										},
									],
									[
										'entry',
										{
											colsep: '0',
											rowsep: '0',
											colname: 'column-2',
										},
									],
								],
								[
									'row',
									[
										'entry',
										{
											colsep: '0',
											rowsep: '0',
											colname: 'column-0',
										},
									],
									[
										'entry',
										{
											colsep: '0',
											rowsep: '0',
											colname: 'column-1',
											id: 'center',
										},
									],
									[
										'entry',
										{
											colsep: '0',
											rowsep: '0',
											colname: 'column-2',
										},
									],
								],
								[
									'row',
									[
										'entry',
										{
											colsep: '0',
											rowsep: '0',
											colname: 'column-0',
										},
									],
									[
										'entry',
										{
											colsep: '0',
											rowsep: '0',
											colname: 'column-1',
										},
									],
									[
										'entry',
										{
											colsep: '0',
											rowsep: '0',
											colname: 'column-2',
										},
									],
								],
							],
						],
					]
				);
			});

			it('can set the right border on the middle cell in a 3x3 table', () => {
				coreDocument.dom.mutate(() =>
					jsonMLMapper.parse(threeByThreeTable, documentNode)
				);

				const cellNodeId = getNodeId(
					evaluateXPathToFirstNode(
						'//entry[@id="center"]',
						documentNode,
						blueprint
					)
				);

				blueprint.beginOverlay();
				toggleCellBorder(
					{
						cellNodeIds: [cellNodeId],
						right: true,
					},
					blueprint
				);
				blueprint.applyOverlay();
				blueprint.realize();
				indicesManager.getIndexSet().commitMerge();

				chai.assert.deepEqual(
					jsonMLMapper.serialize(documentNode.firstChild),
					[
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
									rowsep: '0',
								},
							],
							[
								'colspec',
								{
									colname: 'column-1',
									colnum: '2',
									colwidth: '1*',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'colspec',
								{
									colname: 'column-2',
									colnum: '3',
									colwidth: '1*',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'tbody',
								[
									'row',
									[
										'entry',
										{
											colsep: '0',
											rowsep: '0',
											colname: 'column-0',
										},
									],
									[
										'entry',
										{
											colsep: '0',
											rowsep: '0',
											colname: 'column-1',
										},
									],
									[
										'entry',
										{
											colsep: '0',
											rowsep: '0',
											colname: 'column-2',
										},
									],
								],
								[
									'row',
									[
										'entry',
										{
											colsep: '0',
											rowsep: '0',
											colname: 'column-0',
										},
									],
									[
										'entry',
										{
											colsep: '1',
											rowsep: '0',
											colname: 'column-1',
											id: 'center',
										},
									],
									[
										'entry',
										{
											colsep: '0',
											rowsep: '0',
											colname: 'column-2',
										},
									],
								],
								[
									'row',
									[
										'entry',
										{
											colsep: '0',
											rowsep: '0',
											colname: 'column-0',
										},
									],
									[
										'entry',
										{
											colsep: '0',
											rowsep: '0',
											colname: 'column-1',
										},
									],
									[
										'entry',
										{
											colsep: '0',
											rowsep: '0',
											colname: 'column-2',
										},
									],
								],
							],
						],
					]
				);
			});

			it('can set the bottom border on the middle cell in a 3x3 table', () => {
				coreDocument.dom.mutate(() =>
					jsonMLMapper.parse(threeByThreeTable, documentNode)
				);

				const cellNodeId = getNodeId(
					evaluateXPathToFirstNode(
						'//entry[@id="center"]',
						documentNode,
						blueprint
					)
				);

				blueprint.beginOverlay();
				toggleCellBorder(
					{
						cellNodeIds: [cellNodeId],
						bottom: true,
					},
					blueprint
				);
				blueprint.applyOverlay();
				blueprint.realize();
				indicesManager.getIndexSet().commitMerge();

				chai.assert.deepEqual(
					jsonMLMapper.serialize(documentNode.firstChild),
					[
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
									rowsep: '0',
								},
							],
							[
								'colspec',
								{
									colname: 'column-1',
									colnum: '2',
									colwidth: '1*',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'colspec',
								{
									colname: 'column-2',
									colnum: '3',
									colwidth: '1*',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'tbody',
								[
									'row',
									[
										'entry',
										{
											colsep: '0',
											rowsep: '0',
											colname: 'column-0',
										},
									],
									[
										'entry',
										{
											colsep: '0',
											rowsep: '0',
											colname: 'column-1',
										},
									],
									[
										'entry',
										{
											colsep: '0',
											rowsep: '0',
											colname: 'column-2',
										},
									],
								],
								[
									'row',
									[
										'entry',
										{
											colsep: '0',
											rowsep: '0',
											colname: 'column-0',
										},
									],
									[
										'entry',
										{
											colsep: '0',
											rowsep: '1',
											colname: 'column-1',
											id: 'center',
										},
									],
									[
										'entry',
										{
											colsep: '0',
											rowsep: '0',
											colname: 'column-2',
										},
									],
								],
								[
									'row',
									[
										'entry',
										{
											colsep: '0',
											rowsep: '0',
											colname: 'column-0',
										},
									],
									[
										'entry',
										{
											colsep: '0',
											rowsep: '0',
											colname: 'column-1',
										},
									],
									[
										'entry',
										{
											colsep: '0',
											rowsep: '0',
											colname: 'column-2',
										},
									],
								],
							],
						],
					]
				);
			});

			it('can set the left border on the middle cell in a 3x3 table', () => {
				coreDocument.dom.mutate(() =>
					jsonMLMapper.parse(threeByThreeTable, documentNode)
				);

				const cellNodeId = getNodeId(
					evaluateXPathToFirstNode(
						'//entry[@id="center"]',
						documentNode,
						blueprint
					)
				);

				blueprint.beginOverlay();
				toggleCellBorder(
					{
						cellNodeIds: [cellNodeId],
						left: true,
					},
					blueprint
				);
				blueprint.applyOverlay();
				blueprint.realize();
				indicesManager.getIndexSet().commitMerge();

				chai.assert.deepEqual(
					jsonMLMapper.serialize(documentNode.firstChild),
					[
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
									rowsep: '0',
								},
							],
							[
								'colspec',
								{
									colname: 'column-1',
									colnum: '2',
									colwidth: '1*',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'colspec',
								{
									colname: 'column-2',
									colnum: '3',
									colwidth: '1*',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'tbody',
								[
									'row',
									[
										'entry',
										{
											colsep: '0',
											rowsep: '0',
											colname: 'column-0',
										},
									],
									[
										'entry',
										{
											colsep: '0',
											rowsep: '0',
											colname: 'column-1',
										},
									],
									[
										'entry',
										{
											colsep: '0',
											rowsep: '0',
											colname: 'column-2',
										},
									],
								],
								[
									'row',
									[
										'entry',
										{
											colsep: '1',
											rowsep: '0',
											colname: 'column-0',
										},
									],
									[
										'entry',
										{
											colsep: '0',
											rowsep: '0',
											colname: 'column-1',
											id: 'center',
										},
									],
									[
										'entry',
										{
											colsep: '0',
											rowsep: '0',
											colname: 'column-2',
										},
									],
								],
								[
									'row',
									[
										'entry',
										{
											colsep: '0',
											rowsep: '0',
											colname: 'column-0',
										},
									],
									[
										'entry',
										{
											colsep: '0',
											rowsep: '0',
											colname: 'column-1',
										},
									],
									[
										'entry',
										{
											colsep: '0',
											rowsep: '0',
											colname: 'column-2',
										},
									],
								],
							],
						],
					]
				);
			});

			it('can set all border on the middle cell in a 3x3 table', () => {
				coreDocument.dom.mutate(() =>
					jsonMLMapper.parse(threeByThreeTable, documentNode)
				);

				const cellNodeId = getNodeId(
					evaluateXPathToFirstNode(
						'//entry[@id="center"]',
						documentNode,
						blueprint
					)
				);

				blueprint.beginOverlay();
				toggleCellBorder(
					{
						cellNodeIds: [cellNodeId],
						bottom: true,
						left: true,
						right: true,
						top: true,
					},
					blueprint
				);
				blueprint.applyOverlay();
				blueprint.realize();
				indicesManager.getIndexSet().commitMerge();

				chai.assert.deepEqual(
					jsonMLMapper.serialize(documentNode.firstChild),
					[
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
									rowsep: '0',
								},
							],
							[
								'colspec',
								{
									colname: 'column-1',
									colnum: '2',
									colwidth: '1*',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'colspec',
								{
									colname: 'column-2',
									colnum: '3',
									colwidth: '1*',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'tbody',
								[
									'row',
									[
										'entry',
										{
											colsep: '0',
											rowsep: '0',
											colname: 'column-0',
										},
									],
									[
										'entry',
										{
											colsep: '0',
											rowsep: '1',
											colname: 'column-1',
										},
									],
									[
										'entry',
										{
											colsep: '0',
											rowsep: '0',
											colname: 'column-2',
										},
									],
								],
								[
									'row',
									[
										'entry',
										{
											colsep: '1',
											rowsep: '0',
											colname: 'column-0',
										},
									],
									[
										'entry',
										{
											colsep: '1',
											rowsep: '1',
											colname: 'column-1',
											id: 'center',
										},
									],
									[
										'entry',
										{
											colsep: '0',
											rowsep: '0',
											colname: 'column-2',
										},
									],
								],
								[
									'row',
									[
										'entry',
										{
											colsep: '0',
											rowsep: '0',
											colname: 'column-0',
										},
									],
									[
										'entry',
										{
											colsep: '0',
											rowsep: '0',
											colname: 'column-1',
										},
									],
									[
										'entry',
										{
											colsep: '0',
											rowsep: '0',
											colname: 'column-2',
										},
									],
								],
							],
						],
					]
				);
			});
		});

		const threeByThreeTableWithBorders = [
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
						rowsep: '0',
					},
				],
				[
					'colspec',
					{
						colname: 'column-1',
						colnum: '2',
						colwidth: '1*',
						colsep: '0',
						rowsep: '0',
					},
				],
				[
					'colspec',
					{
						colname: 'column-2',
						colnum: '3',
						colwidth: '1*',
						colsep: '0',
						rowsep: '0',
					},
				],
				[
					'tbody',
					[
						'row',
						[
							'entry',
							{ colsep: '0', rowsep: '0', colname: 'column-0' },
						],
						[
							'entry',
							{ colsep: '0', rowsep: '1', colname: 'column-1' },
						],
						[
							'entry',
							{ colsep: '0', rowsep: '0', colname: 'column-2' },
						],
					],
					[
						'row',
						[
							'entry',
							{ colsep: '1', rowsep: '0', colname: 'column-0' },
						],
						[
							'entry',
							{
								colsep: '1',
								rowsep: '1',
								colname: 'column-1',
								id: 'center',
							},
						],
						[
							'entry',
							{ colsep: '0', rowsep: '0', colname: 'column-2' },
						],
					],
					[
						'row',
						[
							'entry',
							{ colsep: '0', rowsep: '0', colname: 'column-0' },
						],
						[
							'entry',
							{ colsep: '0', rowsep: '0', colname: 'column-1' },
						],
						[
							'entry',
							{ colsep: '0', rowsep: '0', colname: 'column-2' },
						],
					],
				],
			],
		];

		describe('unsetting borders', () => {
			it('can unset the top border on the middle cell in a 3x3 table', () => {
				coreDocument.dom.mutate(() =>
					jsonMLMapper.parse(
						threeByThreeTableWithBorders,
						documentNode
					)
				);

				const cellNodeId = getNodeId(
					evaluateXPathToFirstNode(
						'//entry[@id="center"]',
						documentNode,
						blueprint
					)
				);

				blueprint.beginOverlay();
				toggleCellBorder(
					{
						cellNodeIds: [cellNodeId],
						top: false,
					},
					blueprint
				);
				blueprint.applyOverlay();
				blueprint.realize();
				indicesManager.getIndexSet().commitMerge();

				chai.assert.deepEqual(
					jsonMLMapper.serialize(documentNode.firstChild),
					[
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
									rowsep: '0',
								},
							],
							[
								'colspec',
								{
									colname: 'column-1',
									colnum: '2',
									colwidth: '1*',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'colspec',
								{
									colname: 'column-2',
									colnum: '3',
									colwidth: '1*',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'tbody',
								[
									'row',
									[
										'entry',
										{
											colsep: '0',
											rowsep: '0',
											colname: 'column-0',
										},
									],
									[
										'entry',
										{
											colsep: '0',
											rowsep: '0',
											colname: 'column-1',
										},
									],
									[
										'entry',
										{
											colsep: '0',
											rowsep: '0',
											colname: 'column-2',
										},
									],
								],
								[
									'row',
									[
										'entry',
										{
											colsep: '1',
											rowsep: '0',
											colname: 'column-0',
										},
									],
									[
										'entry',
										{
											colsep: '1',
											rowsep: '1',
											colname: 'column-1',
											id: 'center',
										},
									],
									[
										'entry',
										{
											colsep: '0',
											rowsep: '0',
											colname: 'column-2',
										},
									],
								],
								[
									'row',
									[
										'entry',
										{
											colsep: '0',
											rowsep: '0',
											colname: 'column-0',
										},
									],
									[
										'entry',
										{
											colsep: '0',
											rowsep: '0',
											colname: 'column-1',
										},
									],
									[
										'entry',
										{
											colsep: '0',
											rowsep: '0',
											colname: 'column-2',
										},
									],
								],
							],
						],
					]
				);
			});

			it('can unset the right border on the middle cell in a 3x3 table', () => {
				coreDocument.dom.mutate(() =>
					jsonMLMapper.parse(
						threeByThreeTableWithBorders,
						documentNode
					)
				);

				const cellNodeId = getNodeId(
					evaluateXPathToFirstNode(
						'//entry[@id="center"]',
						documentNode,
						blueprint
					)
				);

				blueprint.beginOverlay();
				toggleCellBorder(
					{
						cellNodeIds: [cellNodeId],
						right: false,
					},
					blueprint
				);
				blueprint.applyOverlay();
				blueprint.realize();
				indicesManager.getIndexSet().commitMerge();

				chai.assert.deepEqual(
					jsonMLMapper.serialize(documentNode.firstChild),
					[
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
									rowsep: '0',
								},
							],
							[
								'colspec',
								{
									colname: 'column-1',
									colnum: '2',
									colwidth: '1*',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'colspec',
								{
									colname: 'column-2',
									colnum: '3',
									colwidth: '1*',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'tbody',
								[
									'row',
									[
										'entry',
										{
											colsep: '0',
											rowsep: '0',
											colname: 'column-0',
										},
									],
									[
										'entry',
										{
											colsep: '0',
											rowsep: '1',
											colname: 'column-1',
										},
									],
									[
										'entry',
										{
											colsep: '0',
											rowsep: '0',
											colname: 'column-2',
										},
									],
								],
								[
									'row',
									[
										'entry',
										{
											colsep: '1',
											rowsep: '0',
											colname: 'column-0',
										},
									],
									[
										'entry',
										{
											colsep: '0',
											rowsep: '1',
											colname: 'column-1',
											id: 'center',
										},
									],
									[
										'entry',
										{
											colsep: '0',
											rowsep: '0',
											colname: 'column-2',
										},
									],
								],
								[
									'row',
									[
										'entry',
										{
											colsep: '0',
											rowsep: '0',
											colname: 'column-0',
										},
									],
									[
										'entry',
										{
											colsep: '0',
											rowsep: '0',
											colname: 'column-1',
										},
									],
									[
										'entry',
										{
											colsep: '0',
											rowsep: '0',
											colname: 'column-2',
										},
									],
								],
							],
						],
					]
				);
			});

			it('can unset the bottom border on the middle cell in a 3x3 table', () => {
				coreDocument.dom.mutate(() =>
					jsonMLMapper.parse(
						threeByThreeTableWithBorders,
						documentNode
					)
				);

				const cellNodeId = getNodeId(
					evaluateXPathToFirstNode(
						'//entry[@id="center"]',
						documentNode,
						blueprint
					)
				);

				blueprint.beginOverlay();
				toggleCellBorder(
					{
						cellNodeIds: [cellNodeId],
						bottom: false,
					},
					blueprint
				);
				blueprint.applyOverlay();
				blueprint.realize();
				indicesManager.getIndexSet().commitMerge();

				chai.assert.deepEqual(
					jsonMLMapper.serialize(documentNode.firstChild),
					[
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
									rowsep: '0',
								},
							],
							[
								'colspec',
								{
									colname: 'column-1',
									colnum: '2',
									colwidth: '1*',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'colspec',
								{
									colname: 'column-2',
									colnum: '3',
									colwidth: '1*',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'tbody',
								[
									'row',
									[
										'entry',
										{
											colsep: '0',
											rowsep: '0',
											colname: 'column-0',
										},
									],
									[
										'entry',
										{
											colsep: '0',
											rowsep: '1',
											colname: 'column-1',
										},
									],
									[
										'entry',
										{
											colsep: '0',
											rowsep: '0',
											colname: 'column-2',
										},
									],
								],
								[
									'row',
									[
										'entry',
										{
											colsep: '1',
											rowsep: '0',
											colname: 'column-0',
										},
									],
									[
										'entry',
										{
											colsep: '1',
											rowsep: '0',
											colname: 'column-1',
											id: 'center',
										},
									],
									[
										'entry',
										{
											colsep: '0',
											rowsep: '0',
											colname: 'column-2',
										},
									],
								],
								[
									'row',
									[
										'entry',
										{
											colsep: '0',
											rowsep: '0',
											colname: 'column-0',
										},
									],
									[
										'entry',
										{
											colsep: '0',
											rowsep: '0',
											colname: 'column-1',
										},
									],
									[
										'entry',
										{
											colsep: '0',
											rowsep: '0',
											colname: 'column-2',
										},
									],
								],
							],
						],
					]
				);
			});

			it('can unset the left border on the middle cell in a 3x3 table', () => {
				coreDocument.dom.mutate(() =>
					jsonMLMapper.parse(
						threeByThreeTableWithBorders,
						documentNode
					)
				);

				const cellNodeId = getNodeId(
					evaluateXPathToFirstNode(
						'//entry[@id="center"]',
						documentNode,
						blueprint
					)
				);

				blueprint.beginOverlay();
				toggleCellBorder(
					{
						cellNodeIds: [cellNodeId],
						left: false,
					},
					blueprint
				);
				blueprint.applyOverlay();
				blueprint.realize();
				indicesManager.getIndexSet().commitMerge();

				chai.assert.deepEqual(
					jsonMLMapper.serialize(documentNode.firstChild),
					[
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
									rowsep: '0',
								},
							],
							[
								'colspec',
								{
									colname: 'column-1',
									colnum: '2',
									colwidth: '1*',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'colspec',
								{
									colname: 'column-2',
									colnum: '3',
									colwidth: '1*',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'tbody',
								[
									'row',
									[
										'entry',
										{
											colsep: '0',
											rowsep: '0',
											colname: 'column-0',
										},
									],
									[
										'entry',
										{
											colsep: '0',
											rowsep: '1',
											colname: 'column-1',
										},
									],
									[
										'entry',
										{
											colsep: '0',
											rowsep: '0',
											colname: 'column-2',
										},
									],
								],
								[
									'row',
									[
										'entry',
										{
											colsep: '0',
											rowsep: '0',
											colname: 'column-0',
										},
									],
									[
										'entry',
										{
											colsep: '1',
											rowsep: '1',
											colname: 'column-1',
											id: 'center',
										},
									],
									[
										'entry',
										{
											colsep: '0',
											rowsep: '0',
											colname: 'column-2',
										},
									],
								],
								[
									'row',
									[
										'entry',
										{
											colsep: '0',
											rowsep: '0',
											colname: 'column-0',
										},
									],
									[
										'entry',
										{
											colsep: '0',
											rowsep: '0',
											colname: 'column-1',
										},
									],
									[
										'entry',
										{
											colsep: '0',
											rowsep: '0',
											colname: 'column-2',
										},
									],
								],
							],
						],
					]
				);
			});

			it('can unset all border on the middle cell in a 3x3 table', () => {
				coreDocument.dom.mutate(() =>
					jsonMLMapper.parse(
						threeByThreeTableWithBorders,
						documentNode
					)
				);

				const cellNodeId = getNodeId(
					evaluateXPathToFirstNode(
						'//entry[@id="center"]',
						documentNode,
						blueprint
					)
				);

				blueprint.beginOverlay();
				toggleCellBorder(
					{
						cellNodeIds: [cellNodeId],
						bottom: false,
						left: false,
						right: false,
						top: false,
					},
					blueprint
				);
				blueprint.applyOverlay();
				blueprint.realize();
				indicesManager.getIndexSet().commitMerge();

				chai.assert.deepEqual(
					jsonMLMapper.serialize(documentNode.firstChild),
					[
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
									rowsep: '0',
								},
							],
							[
								'colspec',
								{
									colname: 'column-1',
									colnum: '2',
									colwidth: '1*',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'colspec',
								{
									colname: 'column-2',
									colnum: '3',
									colwidth: '1*',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'tbody',
								[
									'row',
									[
										'entry',
										{
											colsep: '0',
											rowsep: '0',
											colname: 'column-0',
										},
									],
									[
										'entry',
										{
											colsep: '0',
											rowsep: '0',
											colname: 'column-1',
										},
									],
									[
										'entry',
										{
											colsep: '0',
											rowsep: '0',
											colname: 'column-2',
										},
									],
								],
								[
									'row',
									[
										'entry',
										{
											colsep: '0',
											rowsep: '0',
											colname: 'column-0',
										},
									],
									[
										'entry',
										{
											colsep: '0',
											rowsep: '0',
											colname: 'column-1',
											id: 'center',
										},
									],
									[
										'entry',
										{
											colsep: '0',
											rowsep: '0',
											colname: 'column-2',
										},
									],
								],
								[
									'row',
									[
										'entry',
										{
											colsep: '0',
											rowsep: '0',
											colname: 'column-0',
										},
									],
									[
										'entry',
										{
											colsep: '0',
											rowsep: '0',
											colname: 'column-1',
										},
									],
									[
										'entry',
										{
											colsep: '0',
											rowsep: '0',
											colname: 'column-2',
										},
									],
								],
							],
						],
					]
				);
			});
		});
	});

	describe('on a non-CALS table', () => {
		let documentNode;
		let coreDocument;
		let blueprint;
		let tableDefinition;
		let documentId;

		beforeEach(async () => {
			documentNode = new slimdom.Document();
			coreDocument = new CoreDocument(documentNode);
			const documentController = new DocumentController(coreDocument);
			documentId = await documentsManager.addDocument(
				{},
				documentController
			);

			blueprint = new Blueprint(coreDocument.dom);
			tableDefinition = new TestTableDefinition({
				table: {
					localName: 'table',
					namespaceURI: '',
				},
				tgroup: {
					namespaceURI: '',
				},
			});
			tableDefinitionManager.getTableDefinitions().forEach((def) => {
				tableDefinitionManager.removeTableDefinition(def);
			});
			tableDefinitionManager.addTableDefinition(tableDefinition);
		});

		afterEach(() => {
			blueprint.destroy();
			tableDefinitionManager.removeTableDefinition(tableDefinition);
			documentsManager.removeDocument(documentId);
		});

		it('will not modify non-CALS table as it is not allowed', () => {
			coreDocument.dom.mutate(() =>
				jsonMLMapper.parse(threeByThreeTable, documentNode)
			);

			const cellNodeId = getNodeId(
				evaluateXPathToFirstNode(
					'//entry[@id="center"]',
					documentNode,
					blueprint
				)
			);

			blueprint.beginOverlay();
			toggleCellBorder(
				{
					cellNodeIds: [cellNodeId],
					top: true,
				},
				blueprint
			);
			blueprint.applyOverlay();
			blueprint.realize();
			indicesManager.getIndexSet().commitMerge();

			chai.assert.deepEqual(
				jsonMLMapper.serialize(documentNode.firstChild),
				threeByThreeTable
			);
		});
	});

	describe('mutation status', () => {
		let documentNode;
		let coreDocument;
		let blueprint;
		let tableDefinition;
		let documentId;

		beforeEach(async () => {
			documentNode = new slimdom.Document();
			coreDocument = new CoreDocument(documentNode);
			const documentController = new DocumentController(coreDocument);
			documentId = await documentsManager.addDocument(
				{},
				documentController
			);

			blueprint = new Blueprint(coreDocument.dom);
			tableDefinition = new CalsTableDefinition({
				table: {
					localName: 'table',
					namespaceURI: '',
				},
				tgroup: {
					namespaceURI: '',
				},
			});
			tableDefinitionManager.getTableDefinitions().forEach((def) => {
				tableDefinitionManager.removeTableDefinition(def);
			});
			tableDefinitionManager.addTableDefinition(tableDefinition);
		});

		afterEach(() => {
			blueprint.destroy();
			tableDefinitionManager.removeTableDefinition(tableDefinition);
			documentsManager.removeDocument(documentId);
		});

		describe('setting borders', () => {
			it('sets active if you set the top border on the middle cell when all borders are present', () => {
				coreDocument.dom.mutate(() =>
					jsonMLMapper.parse(threeByThreeTable, documentNode)
				);
				// Set all borders to table.
				evaluateXPathToNodes(
					'descendant::entry',
					documentNode,
					blueprint
				).forEach((cell) => {
					blueprint.setAttribute(cell, 'colsep', '1');
					blueprint.setAttribute(cell, 'rowsep', '1');
				});

				const cellNodeId = getNodeId(
					evaluateXPathToFirstNode(
						'//entry[@id="center"]',
						documentNode,
						blueprint
					)
				);

				const result = toggleCellBorder(
					{
						cellNodeIds: [cellNodeId],
						top: true,
					},
					blueprint
				);
				chai.assert.equal(result.operationIsActive, true);
			});

			it('sets inactive if you set the top border on the middle cell when no border is present', () => {
				coreDocument.dom.mutate(() =>
					jsonMLMapper.parse(threeByThreeTable, documentNode)
				);

				const cellNodeId = getNodeId(
					evaluateXPathToFirstNode(
						'//entry[@id="center"]',
						documentNode,
						blueprint
					)
				);

				const result = toggleCellBorder(
					{
						cellNodeIds: [cellNodeId],
						top: true,
					},
					blueprint
				);
				chai.assert.equal(result.operationIsActive, false);
			});

			it('sets active if you set all borders on the middle cell when all borders are present', () => {
				coreDocument.dom.mutate(() =>
					jsonMLMapper.parse(threeByThreeTable, documentNode)
				);
				// Set all borders to table.
				evaluateXPathToNodes(
					'descendant::entry',
					documentNode,
					blueprint
				).forEach((cell) => {
					blueprint.setAttribute(cell, 'colsep', '1');
					blueprint.setAttribute(cell, 'rowsep', '1');
				});

				const cellNodeId = getNodeId(
					evaluateXPathToFirstNode(
						'//entry[@id="center"]',
						documentNode,
						blueprint
					)
				);

				const result = toggleCellBorder(
					{
						cellNodeIds: [cellNodeId],
						top: true,
						left: true,
						bottom: true,
						right: true,
					},
					blueprint
				);
				chai.assert.equal(result.operationIsActive, true);
			});

			it('sets inactive if you set all borders on the middle cell when no border is present', () => {
				coreDocument.dom.mutate(() =>
					jsonMLMapper.parse(threeByThreeTable, documentNode)
				);

				const cellNodeId = getNodeId(
					evaluateXPathToFirstNode(
						'//entry[@id="center"]',
						documentNode,
						blueprint
					)
				);

				const result = toggleCellBorder(
					{
						cellNodeIds: [cellNodeId],
						top: true,
						left: true,
						bottom: true,
						right: true,
					},
					blueprint
				);
				chai.assert.equal(result.operationIsActive, false);
			});
		});

		describe('unsetting borders', () => {
			it('sets active if you unset the top border on the middle cell when no border is present', () => {
				coreDocument.dom.mutate(() =>
					jsonMLMapper.parse(threeByThreeTable, documentNode)
				);

				const cellNodeId = getNodeId(
					evaluateXPathToFirstNode(
						'//entry[@id="center"]',
						documentNode,
						blueprint
					)
				);

				const result = toggleCellBorder(
					{
						cellNodeIds: [cellNodeId],
						top: false,
					},
					blueprint
				);
				chai.assert.equal(result.operationIsActive, true);
			});

			it('sets inactive if you unset the top border on the middle cell when all borders are present', () => {
				coreDocument.dom.mutate(() =>
					jsonMLMapper.parse(threeByThreeTable, documentNode)
				);
				// Set all borders to table.
				evaluateXPathToNodes(
					'descendant::entry',
					documentNode,
					blueprint
				).forEach((cell) => {
					blueprint.setAttribute(cell, 'colsep', '1');
					blueprint.setAttribute(cell, 'rowsep', '1');
				});

				const cellNodeId = getNodeId(
					evaluateXPathToFirstNode(
						'//entry[@id="center"]',
						documentNode,
						blueprint
					)
				);

				const result = toggleCellBorder(
					{
						cellNodeIds: [cellNodeId],
						top: false,
					},
					blueprint
				);
				chai.assert.equal(result.operationIsActive, false);
			});

			it('sets active if you unset all borders on the middle cell when no border is present', () => {
				coreDocument.dom.mutate(() =>
					jsonMLMapper.parse(threeByThreeTable, documentNode)
				);

				const cellNodeId = getNodeId(
					evaluateXPathToFirstNode(
						'//entry[@id="center"]',
						documentNode,
						blueprint
					)
				);

				const result = toggleCellBorder(
					{
						cellNodeIds: [cellNodeId],
						top: false,
						left: false,
						bottom: false,
						right: false,
					},
					blueprint
				);
				chai.assert.equal(result.operationIsActive, true);
			});

			it('sets inactive if you unset all borders on the middle cell when all borders are present', () => {
				coreDocument.dom.mutate(() =>
					jsonMLMapper.parse(threeByThreeTable, documentNode)
				);
				// Set all borders to table.
				evaluateXPathToNodes(
					'descendant::entry',
					documentNode,
					blueprint
				).forEach((cell) => {
					blueprint.setAttribute(cell, 'colsep', '1');
					blueprint.setAttribute(cell, 'rowsep', '1');
				});

				const cellNodeId = getNodeId(
					evaluateXPathToFirstNode(
						'//entry[@id="center"]',
						documentNode,
						blueprint
					)
				);

				const result = toggleCellBorder(
					{
						cellNodeIds: [cellNodeId],
						top: false,
						left: false,
						bottom: false,
						right: false,
					},
					blueprint
				);
				chai.assert.equal(result.operationIsActive, false);
			});
		});
	});
});
