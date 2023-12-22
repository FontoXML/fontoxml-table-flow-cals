import namespaceManager from 'fontoxml-dom-namespaces/src/namespaceManager';
import type {
	FontoDocumentNode,
	FontoElementNode,
	JsonMl,
} from 'fontoxml-dom-utils/src/types';
import type { XQExpression } from 'fontoxml-selectors/src/types';
import xq from 'fontoxml-selectors/src/xq';
import type TableCell from 'fontoxml-table-flow/src/TableGridModel/TableCell';
import type TableGridModel from 'fontoxml-table-flow/src/TableGridModel/TableGridModel';
import type { TableElementsSharedOptions } from 'fontoxml-table-flow/src/types';
import CalsTableDefinition from 'fontoxml-table-flow-cals/src/table-definition/CalsTableDefinition';
import type { TableElementsCalsOptions } from 'fontoxml-table-flow-cals/src/types';
import { assertDocumentAsJsonMl } from 'fontoxml-unit-test-utils/src/unitTestAssertionHelpers';
import UnitTestEnvironment from 'fontoxml-unit-test-utils/src/UnitTestEnvironment';
import {
	findFirstNodeInDocument,
	runWithBlueprint,
} from 'fontoxml-unit-test-utils/src/unitTestSetupHelpers';

describe('CALS tables: Grid model to XML', () => {
	let environment: UnitTestEnvironment;
	beforeEach(() => {
		environment = new UnitTestEnvironment();
	});
	afterEach(() => {
		environment.destroy();
	});

	function runTest(
		numberOfRows: number,
		numberOfColumns: number,
		hasHeader: boolean,
		modifyGridModel: ((gridModel: TableGridModel) => void) | undefined,
		expected: JsonMl
	): void {
		const documentId = environment.createDocumentFromJsonMl([
			'table',
			['tgroup'],
		]);
		const documentNode = findFirstNodeInDocument(
			documentId,
			xq`self::node()`
		) as FontoDocumentNode;
		const tableDefinition = new CalsTableDefinition({
			table: {
				localName: 'table',
			},
		});
		const tgroupNode = findFirstNodeInDocument(
			documentId,
			xq`/table/tgroup`
		) as FontoElementNode;
		runWithBlueprint((blueprint, _, format) => {
			const tableGridModel = tableDefinition.getTableGridModelBuilder()(
				numberOfRows,
				numberOfColumns,
				hasHeader,
				documentNode
			);
			if (modifyGridModel) {
				modifyGridModel(tableGridModel);
			}
			chai.assert.isTrue(
				tableDefinition.applyToDom(
					tableGridModel,
					tgroupNode,
					blueprint,
					format
				)
			);
		});
		assertDocumentAsJsonMl(documentId, expected);
	}

	describe('Basics', () => {
		it('can serialize a 1x1 table', () => {
			runTest(1, 1, false, undefined, [
				'table',
				[
					'tgroup',
					{ cols: '1' },
					[
						'colspec',
						{
							colname: 'column-0',
							colnum: '1',
							colwidth: '1*',
						},
					],
					['tbody', ['row', ['entry', { colname: 'column-0' }]]],
				],
			]);
		});

		it('can serialize a 4x4 table', () => {
			runTest(4, 4, false, undefined, [
				'table',
				[
					'tgroup',
					{ cols: '4' },
					[
						'colspec',
						{
							colname: 'column-0',
							colnum: '1',
							colwidth: '1*',
						},
					],
					[
						'colspec',
						{
							colname: 'column-1',
							colnum: '2',
							colwidth: '1*',
						},
					],
					[
						'colspec',
						{
							colname: 'column-2',
							colnum: '3',
							colwidth: '1*',
						},
					],
					[
						'colspec',
						{
							colname: 'column-3',
							colnum: '4',
							colwidth: '1*',
						},
					],
					[
						'tbody',
						[
							'row',
							['entry', { colname: 'column-0' }],
							['entry', { colname: 'column-1' }],
							['entry', { colname: 'column-2' }],
							['entry', { colname: 'column-3' }],
						],
						[
							'row',
							['entry', { colname: 'column-0' }],
							['entry', { colname: 'column-1' }],
							['entry', { colname: 'column-2' }],
							['entry', { colname: 'column-3' }],
						],
						[
							'row',
							['entry', { colname: 'column-0' }],
							['entry', { colname: 'column-1' }],
							['entry', { colname: 'column-2' }],
							['entry', { colname: 'column-3' }],
						],
						[
							'row',
							['entry', { colname: 'column-0' }],
							['entry', { colname: 'column-1' }],
							['entry', { colname: 'column-2' }],
							['entry', { colname: 'column-3' }],
						],
					],
				],
			]);
		});
	});

	describe('Headers', () => {
		it('can serialize a 4x4 table with 1 header row', () => {
			runTest(4, 4, true, undefined, [
				'table',
				[
					'tgroup',
					{ cols: '4' },
					[
						'colspec',
						{
							colname: 'column-0',
							colnum: '1',
							colwidth: '1*',
						},
					],
					[
						'colspec',
						{
							colname: 'column-1',
							colnum: '2',
							colwidth: '1*',
						},
					],
					[
						'colspec',
						{
							colname: 'column-2',
							colnum: '3',
							colwidth: '1*',
						},
					],
					[
						'colspec',
						{
							colname: 'column-3',
							colnum: '4',
							colwidth: '1*',
						},
					],
					[
						'thead',
						[
							'row',
							['entry', { colname: 'column-0' }],
							['entry', { colname: 'column-1' }],
							['entry', { colname: 'column-2' }],
							['entry', { colname: 'column-3' }],
						],
					],
					[
						'tbody',
						[
							'row',
							['entry', { colname: 'column-0' }],
							['entry', { colname: 'column-1' }],
							['entry', { colname: 'column-2' }],
							['entry', { colname: 'column-3' }],
						],
						[
							'row',
							['entry', { colname: 'column-0' }],
							['entry', { colname: 'column-1' }],
							['entry', { colname: 'column-2' }],
							['entry', { colname: 'column-3' }],
						],
						[
							'row',
							['entry', { colname: 'column-0' }],
							['entry', { colname: 'column-1' }],
							['entry', { colname: 'column-2' }],
							['entry', { colname: 'column-3' }],
						],
					],
				],
			]);
		});
	});

	describe('Spanning cells', () => {
		it('can serialize a 4x4 table with 1 column spanning cell', () => {
			runTest(
				4,
				4,
				false,
				(tableGridModel) => {
					const spanningCell = tableGridModel.getCellAtCoordinates(
						1,
						1
					) as TableCell;
					spanningCell.size.columns = 2;

					tableGridModel.setCellAtCoordinates(spanningCell, 1, 1);
					tableGridModel.setCellAtCoordinates(spanningCell, 1, 2);
				},
				[
					'table',
					[
						'tgroup',
						{ cols: '4' },
						[
							'colspec',
							{
								colname: 'column-0',
								colnum: '1',
								colwidth: '1*',
							},
						],
						[
							'colspec',
							{
								colname: 'column-1',
								colnum: '2',
								colwidth: '1*',
							},
						],
						[
							'colspec',
							{
								colname: 'column-2',
								colnum: '3',
								colwidth: '1*',
							},
						],
						[
							'colspec',
							{
								colname: 'column-3',
								colnum: '4',
								colwidth: '1*',
							},
						],
						[
							'tbody',
							[
								'row',
								['entry', { colname: 'column-0' }],
								['entry', { colname: 'column-1' }],
								['entry', { colname: 'column-2' }],
								['entry', { colname: 'column-3' }],
							],
							[
								'row',
								['entry', { colname: 'column-0' }],
								[
									'entry',
									{
										namest: 'column-1',
										nameend: 'column-2',
									},
								],
								['entry', { colname: 'column-3' }],
							],
							[
								'row',
								['entry', { colname: 'column-0' }],
								['entry', { colname: 'column-1' }],
								['entry', { colname: 'column-2' }],
								['entry', { colname: 'column-3' }],
							],
							[
								'row',
								['entry', { colname: 'column-0' }],
								['entry', { colname: 'column-1' }],
								['entry', { colname: 'column-2' }],
								['entry', { colname: 'column-3' }],
							],
						],
					],
				]
			);
		});

		it('can serialize a 4x4 table with 1 row spanning cell', () => {
			runTest(
				4,
				4,
				false,
				(tableGridModel) => {
					const spanningCell = tableGridModel.getCellAtCoordinates(
						1,
						1
					) as TableCell;
					spanningCell.size.rows = 2;

					tableGridModel.setCellAtCoordinates(spanningCell, 1, 1);
					tableGridModel.setCellAtCoordinates(spanningCell, 2, 1);
				},
				[
					'table',
					[
						'tgroup',
						{ cols: '4' },
						[
							'colspec',
							{
								colname: 'column-0',
								colnum: '1',
								colwidth: '1*',
							},
						],
						[
							'colspec',
							{
								colname: 'column-1',
								colnum: '2',
								colwidth: '1*',
							},
						],
						[
							'colspec',
							{
								colname: 'column-2',
								colnum: '3',
								colwidth: '1*',
							},
						],
						[
							'colspec',
							{
								colname: 'column-3',
								colnum: '4',
								colwidth: '1*',
							},
						],
						[
							'tbody',
							[
								'row',
								['entry', { colname: 'column-0' }],
								['entry', { colname: 'column-1' }],
								['entry', { colname: 'column-2' }],
								['entry', { colname: 'column-3' }],
							],
							[
								'row',
								['entry', { colname: 'column-0' }],
								[
									'entry',
									{ colname: 'column-1', morerows: '1' },
								],
								['entry', { colname: 'column-2' }],
								['entry', { colname: 'column-3' }],
							],
							[
								'row',
								['entry', { colname: 'column-0' }],
								['entry', { colname: 'column-2' }],
								['entry', { colname: 'column-3' }],
							],
							[
								'row',
								['entry', { colname: 'column-0' }],
								['entry', { colname: 'column-1' }],
								['entry', { colname: 'column-2' }],
								['entry', { colname: 'column-3' }],
							],
						],
					],
				]
			);
		});

		it('can serialize a 4x4 table with 1 column and row spanning cell', () => {
			runTest(
				4,
				4,
				false,
				(tableGridModel) => {
					const spanningCell = tableGridModel.getCellAtCoordinates(
						1,
						1
					) as TableCell;
					spanningCell.size.columns = 2;
					spanningCell.size.rows = 2;

					tableGridModel.setCellAtCoordinates(spanningCell, 1, 1);
					tableGridModel.setCellAtCoordinates(spanningCell, 1, 2);
					tableGridModel.setCellAtCoordinates(spanningCell, 2, 1);
					tableGridModel.setCellAtCoordinates(spanningCell, 2, 2);
				},
				[
					'table',
					[
						'tgroup',
						{ cols: '4' },
						[
							'colspec',
							{
								colname: 'column-0',
								colnum: '1',
								colwidth: '1*',
							},
						],
						[
							'colspec',
							{
								colname: 'column-1',
								colnum: '2',
								colwidth: '1*',
							},
						],
						[
							'colspec',
							{
								colname: 'column-2',
								colnum: '3',
								colwidth: '1*',
							},
						],
						[
							'colspec',
							{
								colname: 'column-3',
								colnum: '4',
								colwidth: '1*',
							},
						],
						[
							'tbody',
							[
								'row',
								['entry', { colname: 'column-0' }],
								['entry', { colname: 'column-1' }],
								['entry', { colname: 'column-2' }],
								['entry', { colname: 'column-3' }],
							],
							[
								'row',
								['entry', { colname: 'column-0' }],
								[
									'entry',
									{
										namest: 'column-1',
										nameend: 'column-2',
										morerows: '1',
									},
								],
								['entry', { colname: 'column-3' }],
							],
							[
								'row',
								['entry', { colname: 'column-0' }],
								['entry', { colname: 'column-3' }],
							],
							[
								'row',
								['entry', { colname: 'column-0' }],
								['entry', { colname: 'column-1' }],
								['entry', { colname: 'column-2' }],
								['entry', { colname: 'column-3' }],
							],
						],
					],
				]
			);
		});
	});

	describe('Namespaces', () => {
		function runTest(
			options: TableElementsCalsOptions & TableElementsSharedOptions,
			jsonIn: JsonMl,
			tgroupQuery: XQExpression,
			numberOfRows: number,
			numberOfColumns: number,
			hasHeader: boolean,
			expected: JsonMl
		): void {
			const documentId = environment.createDocumentFromJsonMl(jsonIn);
			const documentNode = findFirstNodeInDocument(
				documentId,
				xq`self::node()`
			) as FontoDocumentNode;
			const tableDefinition = new CalsTableDefinition(options);
			const tgroupNode = findFirstNodeInDocument(
				documentId,
				tgroupQuery
			) as FontoElementNode;
			runWithBlueprint((blueprint, _, format) => {
				const tableGridModel =
					tableDefinition.getTableGridModelBuilder()(
						numberOfRows,
						numberOfColumns,
						hasHeader,
						documentNode
					);
				chai.assert.isTrue(
					tableDefinition.applyToDom(
						tableGridModel,
						tgroupNode,
						blueprint,
						format
					)
				);
			});
			assertDocumentAsJsonMl(documentId, expected);
		}
		it('can serialize a 4x4 table with namespaces and non-default names for thead', () => {
			namespaceManager.addNamespace('ns1', 'http://example.com/ns1');
			namespaceManager.addNamespace('ns2', 'http://example.com/ns2');

			runTest(
				{
					table: {
						localName: 'matrix',
						namespaceURI: 'http://example.com/ns1',
					},
					tgroup: {
						namespaceURI: 'http://example.com/ns2',
					},
				},
				[
					'ns1:matrix',
					{ 'xmlns:ns1': 'http://example.com/ns1' },
					['ns2:tgroup', { 'xmlns:ns2': 'http://example.com/ns2' }],
				],
				xq`//*:tgroup`,
				4,
				4,
				true,
				[
					'ns1:matrix',
					{ 'xmlns:ns1': 'http://example.com/ns1' },
					[
						'ns2:tgroup',
						{ 'xmlns:ns2': 'http://example.com/ns2', cols: '4' },
						[
							'ns2:colspec',
							{
								colname: 'column-0',
								colnum: '1',
								colwidth: '1*',
							},
						],
						[
							'ns2:colspec',
							{
								colname: 'column-1',
								colnum: '2',
								colwidth: '1*',
							},
						],
						[
							'ns2:colspec',
							{
								colname: 'column-2',
								colnum: '3',
								colwidth: '1*',
							},
						],
						[
							'ns2:colspec',
							{
								colname: 'column-3',
								colnum: '4',
								colwidth: '1*',
							},
						],
						[
							'ns2:thead',
							[
								'ns2:row',
								[
									'ns2:entry',
									{
										colname: 'column-0',
									},
								],
								[
									'ns2:entry',
									{
										colname: 'column-1',
									},
								],
								[
									'ns2:entry',
									{
										colname: 'column-2',
									},
								],
								[
									'ns2:entry',
									{
										colname: 'column-3',
									},
								],
							],
						],
						[
							'ns2:tbody',
							[
								'ns2:row',
								[
									'ns2:entry',
									{
										colname: 'column-0',
									},
								],
								[
									'ns2:entry',
									{
										colname: 'column-1',
									},
								],
								[
									'ns2:entry',
									{
										colname: 'column-2',
									},
								],
								[
									'ns2:entry',
									{
										colname: 'column-3',
									},
								],
							],
							[
								'ns2:row',
								[
									'ns2:entry',
									{
										colname: 'column-0',
									},
								],
								[
									'ns2:entry',
									{
										colname: 'column-1',
									},
								],
								[
									'ns2:entry',
									{
										colname: 'column-2',
									},
								],
								[
									'ns2:entry',
									{
										colname: 'column-3',
									},
								],
							],
							[
								'ns2:row',
								[
									'ns2:entry',
									{
										colname: 'column-0',
									},
								],
								[
									'ns2:entry',
									{
										colname: 'column-1',
									},
								],
								[
									'ns2:entry',
									{
										colname: 'column-2',
									},
								],
								[
									'ns2:entry',
									{
										colname: 'column-3',
									},
								],
							],
						],
					],
				]
			);
		});

		describe('Non-default names and namespaces', () => {
			it('can serialize a 4x4 table with non-default names and namespaces', () => {
				namespaceManager.addNamespace(
					'nstable',
					'http://example.com/nstable'
				);
				namespaceManager.addNamespace(
					'nstgroup',
					'http://example.com/nstgroup'
				);
				namespaceManager.addNamespace(
					'nsentry',
					'http://example.com/nsentry'
				);
				namespaceManager.addNamespace(
					'nscolspec',
					'http://example.com/nscolspec'
				);
				namespaceManager.addNamespace(
					'nsrow',
					'http://example.com/nsrow'
				);
				namespaceManager.addNamespace(
					'nstbody',
					'http://example.com/nstbody'
				);
				namespaceManager.addNamespace(
					'nsthead',
					'http://example.com/nsthead'
				);

				runTest(
					{
						table: {
							localName: 'mtable',
							namespaceURI: 'http://example.com/nstable',
						},
						tgroup: {
							localName: 'mtgroup',
							namespaceURI: 'http://example.com/nstgroup',
						},
						entry: {
							localName: 'mentry',
							namespaceURI: 'http://example.com/nsentry',
							defaultTextContainer: 'p',
						},

						align: {
							localName: 'malign',
							leftValue: 'mleft',
							rightValue: 'mright',
							centerValue: 'mcenter',
							justifyValue: 'mjustify',
						},

						colname: {
							localName: 'mcolname',
						},

						colnum: { localName: 'mcolnum' },

						cols: { localName: 'mcols' },

						colsep: { localName: 'mcolsep' },

						colspec: {
							localName: 'mcolspec',
							namespaceURI: 'http://example.com/nscolspec',
						},

						colwidth: { localName: 'mcolwidth' },

						frame: {
							localName: 'mframe',
							allValue: 'mall',
							noneValue: 'mnone',
						},

						morerows: { localName: 'mmorerows' },

						nameend: {
							localName: 'mnameend',
						},

						namest: {
							localName: 'mnamest',
						},

						row: {
							localName: 'mrow',
							namespaceURI: 'http://example.com/nsrow',
						},

						rowsep: { localName: 'mrowsep' },

						tbody: {
							localName: 'mtbody',
							namespaceURI: 'http://example.com/nstbody',
						},

						thead: {
							localName: 'mthead',
							namespaceURI: 'http://example.com/nsthead',
						},

						valign: {
							localName: 'mvalign',
							topValue: 'mtop',
							middleValue: 'mmiddle',
							bottomValue: 'mbottom',
						},

						yesOrNo: {
							yesValue: 'm1',
							noValue: 'm0',
						},
					},
					[
						'nstable:mtable',
						{ 'xmlns:nstable': 'http://example.com/nstable' },
						[
							'nstgroup:mtgroup',
							{ 'xmlns:nstgroup': 'http://example.com/nstgroup' },
						],
					],
					xq`//*:mtgroup`,
					4,
					4,
					true,
					[
						'nstable:mtable',
						{ 'xmlns:nstable': 'http://example.com/nstable' },
						[
							'nstgroup:mtgroup',
							{
								'xmlns:nstgroup': 'http://example.com/nstgroup',
								mcols: '4',
							},
							[
								'nscolspec:mcolspec',
								{
									mcolname: 'column-0',
									mcolnum: '1',
									mcolwidth: '1*',
									'xmlns:nscolspec':
										'http://example.com/nscolspec',
								},
							],
							[
								'nscolspec:mcolspec',
								{
									mcolname: 'column-1',
									mcolnum: '2',
									mcolwidth: '1*',
									'xmlns:nscolspec':
										'http://example.com/nscolspec',
								},
							],
							[
								'nscolspec:mcolspec',
								{
									mcolname: 'column-2',
									mcolnum: '3',
									mcolwidth: '1*',
									'xmlns:nscolspec':
										'http://example.com/nscolspec',
								},
							],
							[
								'nscolspec:mcolspec',
								{
									mcolname: 'column-3',
									mcolnum: '4',
									mcolwidth: '1*',
									'xmlns:nscolspec':
										'http://example.com/nscolspec',
								},
							],
							[
								'nsthead:mthead',
								{
									'xmlns:nsthead':
										'http://example.com/nsthead',
								},
								[
									'nsrow:mrow',
									{
										'xmlns:nsrow':
											'http://example.com/nsrow',
									},
									[
										'nsentry:mentry',
										{
											mcolname: 'column-0',
											'xmlns:nsentry':
												'http://example.com/nsentry',
										},
									],
									[
										'nsentry:mentry',
										{
											mcolname: 'column-1',
											'xmlns:nsentry':
												'http://example.com/nsentry',
										},
									],
									[
										'nsentry:mentry',
										{
											mcolname: 'column-2',
											'xmlns:nsentry':
												'http://example.com/nsentry',
										},
									],
									[
										'nsentry:mentry',
										{
											mcolname: 'column-3',
											'xmlns:nsentry':
												'http://example.com/nsentry',
										},
									],
								],
							],
							[
								'nstbody:mtbody',
								{
									'xmlns:nstbody':
										'http://example.com/nstbody',
								},
								[
									'nsrow:mrow',
									{
										'xmlns:nsrow':
											'http://example.com/nsrow',
									},
									[
										'nsentry:mentry',
										{
											mcolname: 'column-0',
											'xmlns:nsentry':
												'http://example.com/nsentry',
										},
									],
									[
										'nsentry:mentry',
										{
											mcolname: 'column-1',
											'xmlns:nsentry':
												'http://example.com/nsentry',
										},
									],
									[
										'nsentry:mentry',
										{
											mcolname: 'column-2',
											'xmlns:nsentry':
												'http://example.com/nsentry',
										},
									],
									[
										'nsentry:mentry',
										{
											mcolname: 'column-3',
											'xmlns:nsentry':
												'http://example.com/nsentry',
										},
									],
								],
								[
									'nsrow:mrow',
									{
										'xmlns:nsrow':
											'http://example.com/nsrow',
									},
									[
										'nsentry:mentry',
										{
											mcolname: 'column-0',
											'xmlns:nsentry':
												'http://example.com/nsentry',
										},
									],
									[
										'nsentry:mentry',
										{
											mcolname: 'column-1',
											'xmlns:nsentry':
												'http://example.com/nsentry',
										},
									],
									[
										'nsentry:mentry',
										{
											mcolname: 'column-2',
											'xmlns:nsentry':
												'http://example.com/nsentry',
										},
									],
									[
										'nsentry:mentry',
										{
											mcolname: 'column-3',
											'xmlns:nsentry':
												'http://example.com/nsentry',
										},
									],
								],
								[
									'nsrow:mrow',
									{
										'xmlns:nsrow':
											'http://example.com/nsrow',
									},
									[
										'nsentry:mentry',
										{
											mcolname: 'column-0',
											'xmlns:nsentry':
												'http://example.com/nsentry',
										},
									],
									[
										'nsentry:mentry',
										{
											mcolname: 'column-1',
											'xmlns:nsentry':
												'http://example.com/nsentry',
										},
									],
									[
										'nsentry:mentry',
										{
											mcolname: 'column-2',
											'xmlns:nsentry':
												'http://example.com/nsentry',
										},
									],
									[
										'nsentry:mentry',
										{
											mcolname: 'column-3',
											'xmlns:nsentry':
												'http://example.com/nsentry',
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
});
