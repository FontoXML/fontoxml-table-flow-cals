import namespaceManager from 'fontoxml-dom-namespaces/src/namespaceManager';
import type {
	FontoDocumentNode,
	FontoElementNode,
	JsonMl,
} from 'fontoxml-dom-utils/src/types';
import xq from 'fontoxml-selectors/src/xq';
import type TableCell from 'fontoxml-table-flow/src/TableGridModel/TableCell';
import type TableGridModel from 'fontoxml-table-flow/src/TableGridModel/TableGridModel';
import CalsTableDefinition from 'fontoxml-table-flow-cals/src/table-definition/CalsTableDefinition';
import { assertDocumentAsJsonMl } from 'fontoxml-unit-test-utils/src/unitTestAssertionHelpers';
import UnitTestEnvironment from 'fontoxml-unit-test-utils/src/UnitTestEnvironment';
import {
	findFirstNodeInDocument,
	runWithBlueprint,
} from 'fontoxml-unit-test-utils/src/unitTestSetupHelpers';

describe('tableGridModelToCalsTable with namespaces', () => {
	before(() => {
		namespaceManager.addNamespace('somenamespace', 'somenamespace-uri');
	});

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
		jsonOut: JsonMl
	): void {
		const documentId = environment.createDocumentFromJsonMl([
			'somenamespace:table',
			{ 'xmlns:somenamespace': 'somenamespace-uri' },
			['somenamespace:tgroup', ['somenamespace:tbody']],
		]);
		const documentNode = findFirstNodeInDocument(
			documentId,
			xq`self::node()`
		) as FontoDocumentNode;
		const tableDefinition = new CalsTableDefinition({
			table: {
				localName: 'table',
				namespaceURI: 'somenamespace-uri',
			},
			tgroup: {
				namespaceURI: 'somenamespace-uri',
			},
		});

		const tgroupNode = findFirstNodeInDocument(
			documentId,
			xq`/*:table/*:tgroup`
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

		assertDocumentAsJsonMl(documentId, jsonOut);
	}

	it('can serialize a calsTable in a basic one by one GridModel to an actual cals table', () => {
		// Create a new one-by-one table
		runTest(1, 1, true, undefined, [
			'somenamespace:table',
			{ 'xmlns:somenamespace': 'somenamespace-uri', frame: 'all' },
			[
				'somenamespace:tgroup',
				{ cols: '1' },
				[
					'somenamespace:colspec',
					{ colname: 'column-0', colnum: '1', colwidth: '1*' },
				],
				[
					'somenamespace:tbody',
					[
						'somenamespace:row',
						['somenamespace:entry', { colname: 'column-0' }],
					],
				],
			],
		]);
	});

	it('can serialize a calsTable in a basic n by n GridModel to an actual cals table', () => {
		// Create a new four-by-four table
		runTest(3, 4, true, undefined, [
			'somenamespace:table',
			{ 'xmlns:somenamespace': 'somenamespace-uri', frame: 'all' },
			[
				'somenamespace:tgroup',
				{ cols: '4' },
				[
					'somenamespace:colspec',
					{ colname: 'column-0', colnum: '1', colwidth: '1*' },
				],
				[
					'somenamespace:colspec',
					{ colname: 'column-1', colnum: '2', colwidth: '1*' },
				],
				[
					'somenamespace:colspec',
					{ colname: 'column-2', colnum: '3', colwidth: '1*' },
				],
				[
					'somenamespace:colspec',
					{ colname: 'column-3', colnum: '4', colwidth: '1*' },
				],
				[
					'somenamespace:thead',
					[
						'somenamespace:row',
						['somenamespace:entry', { colname: 'column-0' }],
						['somenamespace:entry', { colname: 'column-1' }],
						['somenamespace:entry', { colname: 'column-2' }],
						['somenamespace:entry', { colname: 'column-3' }],
					],
				],
				[
					'somenamespace:tbody',
					[
						'somenamespace:row',
						['somenamespace:entry', { colname: 'column-0' }],
						['somenamespace:entry', { colname: 'column-1' }],
						['somenamespace:entry', { colname: 'column-2' }],
						['somenamespace:entry', { colname: 'column-3' }],
					],
					[
						'somenamespace:row',
						['somenamespace:entry', { colname: 'column-0' }],
						['somenamespace:entry', { colname: 'column-1' }],
						['somenamespace:entry', { colname: 'column-2' }],
						['somenamespace:entry', { colname: 'column-3' }],
					],
				],
			],
		]);
	});

	it('can serialize a calsTable in a GridModel containing colspans to an actual cals table', () => {
		// Create a new three-by-four table
		runTest(
			3,
			4,
			true,
			(tableGridModel) => {
				const spanningCell = tableGridModel.getCellAtCoordinates(
					1,
					1
				) as TableCell;
				spanningCell.size.rows = 2;
				spanningCell.size.columns = 2;

				tableGridModel.setCellAtCoordinates(spanningCell, 1, 1);
				tableGridModel.setCellAtCoordinates(spanningCell, 1, 2);
				tableGridModel.setCellAtCoordinates(spanningCell, 2, 1);
				tableGridModel.setCellAtCoordinates(spanningCell, 2, 2);
			},
			[
				'somenamespace:table',
				{ 'xmlns:somenamespace': 'somenamespace-uri', frame: 'all' },
				[
					'somenamespace:tgroup',
					{ cols: '4' },
					[
						'somenamespace:colspec',
						{ colname: 'column-0', colnum: '1', colwidth: '1*' },
					],
					[
						'somenamespace:colspec',
						{ colname: 'column-1', colnum: '2', colwidth: '1*' },
					],
					[
						'somenamespace:colspec',
						{ colname: 'column-2', colnum: '3', colwidth: '1*' },
					],
					[
						'somenamespace:colspec',
						{ colname: 'column-3', colnum: '4', colwidth: '1*' },
					],
					[
						'somenamespace:thead',
						[
							'somenamespace:row',
							['somenamespace:entry', { colname: 'column-0' }],
							['somenamespace:entry', { colname: 'column-1' }],
							['somenamespace:entry', { colname: 'column-2' }],
							['somenamespace:entry', { colname: 'column-3' }],
						],
					],
					[
						'somenamespace:tbody',
						[
							'somenamespace:row',
							['somenamespace:entry', { colname: 'column-0' }],
							[
								'somenamespace:entry',
								{
									namest: 'column-1',
									nameend: 'column-2',
									morerows: '1',
								},
							],
							['somenamespace:entry', { colname: 'column-3' }],
						],
						[
							'somenamespace:row',
							['somenamespace:entry', { colname: 'column-0' }],
							['somenamespace:entry', { colname: 'column-3' }],
						],
					],
				],
			]
		);
	});
});
