import type Blueprint from 'fontoxml-blueprints/src/Blueprint';
import type { FontoElementNode, JsonMl } from 'fontoxml-dom-utils/src/types';
import format from 'fontoxml-schema-experience/src/format';
import xq from 'fontoxml-selectors/src/xq';
import { isTableGridModel } from 'fontoxml-table-flow/src/indexedTableGridModels';
import registerCustomXPathFunctions from 'fontoxml-table-flow/src/registerCustomXPathFunctions';
import tableDefinitionManager from 'fontoxml-table-flow/src/tableDefinitionManager';
import mergeCells from 'fontoxml-table-flow/src/TableGridModel/mutations/merging/mergeCells';
import splitSpanningCell from 'fontoxml-table-flow/src/TableGridModel/mutations/splitting/splitSpanningCell';
import type TableCell from 'fontoxml-table-flow/src/TableGridModel/TableCell';
import type TableGridModel from 'fontoxml-table-flow/src/TableGridModel/TableGridModel';
import type { TableElementsSharedOptions } from 'fontoxml-table-flow/src/types';
import CalsTableDefinition from 'fontoxml-table-flow-cals/src/table-definition/CalsTableDefinition';
import type { TableElementsCalsOptions } from 'fontoxml-table-flow-cals/src/types';
import { assertDocumentAsJsonMl } from 'fontoxml-unit-test-utils/src/unitTestAssertionHelpers';
import UnitTestEnvironment from 'fontoxml-unit-test-utils/src/UnitTestEnvironment';
import {
	findFirstNodeInDocument,
	findNodesInDocument,
	runWithBlueprint,
} from 'fontoxml-unit-test-utils/src/unitTestSetupHelpers';

const mergeCellWithCellToTheRight = mergeCells.mergeCellWithCellToTheRight;
const mergeCellWithCellToTheLeft = mergeCells.mergeCellWithCellToTheLeft;
const mergeCellWithCellBelow = mergeCells.mergeCellWithCellBelow;
const mergeCellWithCellAbove = mergeCells.mergeCellWithCellAbove;

const splitCellIntoRows = splitSpanningCell.splitCellIntoRows;
const splitCellIntoColumns = splitSpanningCell.splitCellIntoColumns;

registerCustomXPathFunctions();

describe('CALS tables: XML to XML roundtrip', () => {
	let environment: UnitTestEnvironment;
	beforeEach(() => {
		environment = new UnitTestEnvironment();
	});
	afterEach(() => {
		environment.destroy();
	});

	function runTest(
		jsonIn: JsonMl,
		jsonOut: JsonMl,
		options: TableElementsCalsOptions & TableElementsSharedOptions = {
			table: {
				localName: 'table',
			},
		},
		mutateGridModel: (
			gridModel: TableGridModel,
			blueprint: Blueprint
		) => void = () => {
			// Do nothing
		},
		ignoreColNames = false
	): void {
		const documentId = environment.createDocumentFromJsonMl(jsonIn);
		const tableDefinition = new CalsTableDefinition(options);
		tableDefinitionManager.addTableDefinition(tableDefinition);

		const tgroupNode = findFirstNodeInDocument(
			documentId,
			xq`//tgroup`
		) as FontoElementNode;
		runWithBlueprint((blueprint) => {
			const gridModel = tableDefinition.buildTableGridModel(
				tgroupNode,
				blueprint
			);
			if (!isTableGridModel(gridModel)) {
				throw gridModel.error;
			}

			mutateGridModel(gridModel, blueprint);

			const success = tableDefinition.applyToDom(
				gridModel,
				tgroupNode,
				blueprint,
				format
			);
			chai.assert.isTrue(success);

			if (ignoreColNames) {
				// Remove colname attributes from the blueprint...
				for (const element of findNodesInDocument(
					documentId,
					xq`//*[@colname]`,
					blueprint
				) as FontoElementNode[]) {
					blueprint.removeAttribute(element, 'colname');
				}
				// ...and from the expected JsonMl
				(function remove(jsonEl: JsonMl) {
					const [_name, attrs, ...children] = jsonEl;
					if (typeof attrs === 'object') {
						if (Array.isArray(attrs)) {
							remove(attrs);
						} else {
							delete attrs['colname'];
							if (Object.keys(attrs).length === 0) {
								(jsonEl as unknown[]).splice(1, 1);
							}
						}
					}
					for (const child of children) {
						remove(child as JsonMl);
					}
				})(jsonOut);
			}
		});

		assertDocumentAsJsonMl(documentId, jsonOut);
	}

	describe('Without changes', () => {
		it('can handle a 1x1 table, changing nothing', () => {
			const jsonIn: JsonMl = [
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
						},
					],
					['tbody', ['row', ['entry', { colname: 'column-0' }]]],
				],
			];

			const jsonOut: JsonMl = [
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
						},
					],
					['tbody', ['row', ['entry', { colname: 'column-0' }]]],
				],
			];

			const options = {
				table: {
					localName: 'table',
				},
			};

			runTest(jsonIn, jsonOut, options);
		});

		it('can handle a 1x1 table with rowsep and colsep, changing nothing', () => {
			const jsonIn: JsonMl = [
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
							rowsep: '0',
							colsep: '0',
						},
					],
					[
						'tbody',
						[
							'row',
							[
								'entry',
								{
									colname: 'column-0',
									rowsep: '0',
									colsep: '0',
								},
							],
						],
					],
				],
			];

			const jsonOut: JsonMl = [
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
							rowsep: '0',
							colsep: '0',
						},
					],
					[
						'tbody',
						[
							'row',
							[
								'entry',
								{
									colname: 'column-0',
									rowsep: '0',
									colsep: '0',
								},
							],
						],
					],
				],
			];

			const options = {
				table: {
					localName: 'table',
				},
			};

			runTest(jsonIn, jsonOut, options);
		});

		it('can handle a 4x4 table, changing nothing', () => {
			const jsonIn: JsonMl = [
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
			];

			const jsonOut: JsonMl = [
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
			];

			const options = {
				table: {
					localName: 'table',
				},
			};

			runTest(jsonIn, jsonOut, options);
		});

		it('can handle a 4x4 table with rowsep and colsep, changing nothing', () => {
			const jsonIn: JsonMl = [
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
							rowsep: '0',
							colsep: '0',
						},
					],
					[
						'colspec',
						{
							colname: 'column-1',
							colnum: '2',
							colwidth: '1*',
							rowsep: '0',
							colsep: '0',
						},
					],
					[
						'colspec',
						{
							colname: 'column-2',
							colnum: '3',
							colwidth: '1*',
							rowsep: '0',
							colsep: '0',
						},
					],
					[
						'colspec',
						{
							colname: 'column-3',
							colnum: '4',
							colwidth: '1*',
							rowsep: '0',
							colsep: '0',
						},
					],
					[
						'tbody',
						[
							'row',
							[
								'entry',
								{
									colname: 'column-0',
									rowsep: '0',
									colsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-1',
									rowsep: '0',
									colsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-2',
									rowsep: '0',
									colsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-3',
									rowsep: '0',
									colsep: '0',
								},
							],
						],
						[
							'row',
							'row',
							[
								'entry',
								{
									colname: 'column-0',
									rowsep: '0',
									colsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-1',
									rowsep: '0',
									colsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-2',
									rowsep: '0',
									colsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-3',
									rowsep: '0',
									colsep: '0',
								},
							],
						],
						[
							'row',
							'row',
							[
								'entry',
								{
									colname: 'column-0',
									rowsep: '0',
									colsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-1',
									rowsep: '0',
									colsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-2',
									rowsep: '0',
									colsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-3',
									rowsep: '0',
									colsep: '0',
								},
							],
						],
						[
							'row',
							'row',
							[
								'entry',
								{
									colname: 'column-0',
									rowsep: '0',
									colsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-1',
									rowsep: '0',
									colsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-2',
									rowsep: '0',
									colsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-3',
									rowsep: '0',
									colsep: '0',
								},
							],
						],
					],
				],
			];

			const jsonOut: JsonMl = [
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
							rowsep: '0',
							colsep: '0',
						},
					],
					[
						'colspec',
						{
							colname: 'column-1',
							colnum: '2',
							colwidth: '1*',
							rowsep: '0',
							colsep: '0',
						},
					],
					[
						'colspec',
						{
							colname: 'column-2',
							colnum: '3',
							colwidth: '1*',
							rowsep: '0',
							colsep: '0',
						},
					],
					[
						'colspec',
						{
							colname: 'column-3',
							colnum: '4',
							colwidth: '1*',
							rowsep: '0',
							colsep: '0',
						},
					],
					[
						'tbody',
						[
							'row',
							[
								'entry',
								{
									colname: 'column-0',
									rowsep: '0',
									colsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-1',
									rowsep: '0',
									colsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-2',
									rowsep: '0',
									colsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-3',
									rowsep: '0',
									colsep: '0',
								},
							],
						],
						[
							'row',
							'row',
							[
								'entry',
								{
									colname: 'column-0',
									rowsep: '0',
									colsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-1',
									rowsep: '0',
									colsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-2',
									rowsep: '0',
									colsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-3',
									rowsep: '0',
									colsep: '0',
								},
							],
						],
						[
							'row',
							'row',
							[
								'entry',
								{
									colname: 'column-0',
									rowsep: '0',
									colsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-1',
									rowsep: '0',
									colsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-2',
									rowsep: '0',
									colsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-3',
									rowsep: '0',
									colsep: '0',
								},
							],
						],
						[
							'row',
							'row',
							[
								'entry',
								{
									colname: 'column-0',
									rowsep: '0',
									colsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-1',
									rowsep: '0',
									colsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-2',
									rowsep: '0',
									colsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-3',
									rowsep: '0',
									colsep: '0',
								},
							],
						],
					],
				],
			];

			const options = {
				table: {
					localName: 'table',
				},
			};

			runTest(jsonIn, jsonOut, options);
		});
	});

	describe('Header rows', () => {
		it('can handle a 4x4 table, increasing header row count by 1', () => {
			const jsonIn: JsonMl = [
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
			];

			const mutateGridModel = (gridModel) =>
				gridModel.increaseHeaderRowCount(1);

			const jsonOut: JsonMl = [
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
			];

			const options = {
				table: {
					localName: 'table',
				},
			};

			runTest(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table with 1 header row, increasing header row count by 1', () => {
			const jsonIn: JsonMl = [
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
			];

			const mutateGridModel = (gridModel) =>
				gridModel.increaseHeaderRowCount(1);

			const jsonOut: JsonMl = [
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
					],
				],
			];

			const options = {
				table: {
					localName: 'table',
				},
			};

			runTest(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table with 1 header row, decreasing header row count by 1', () => {
			const jsonIn: JsonMl = [
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
			];

			const mutateGridModel = (gridModel) =>
				gridModel.decreaseHeaderRowCount();

			const jsonOut: JsonMl = [
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
			];

			const options = {
				table: {
					localName: 'table',
				},
			};

			runTest(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table with 2 header rows, decreasing header row count by 1', () => {
			const jsonIn: JsonMl = [
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
					],
				],
			];

			const mutateGridModel = (gridModel) =>
				gridModel.decreaseHeaderRowCount();

			const jsonOut: JsonMl = [
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
			];

			const options = {
				table: {
					localName: 'table',
				},
			};

			runTest(jsonIn, jsonOut, options, mutateGridModel);
		});
	});

	describe('Insert row', () => {
		it('can handle a 4x4 table, adding 1 row before index 0', () => {
			const jsonIn: JsonMl = [
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
			];

			const mutateGridModel = (gridModel) =>
				gridModel.insertRow(0, false);

			const jsonOut: JsonMl = [
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
						[
							'row',
							['entry', { colname: 'column-0' }],
							['entry', { colname: 'column-1' }],
							['entry', { colname: 'column-2' }],
							['entry', { colname: 'column-3' }],
						],
					],
				],
			];

			const options = {
				table: {
					localName: 'table',
				},
			};

			runTest(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table, adding 1 row before index 2 (middle)', () => {
			const jsonIn: JsonMl = [
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
			];

			const mutateGridModel = (gridModel) =>
				gridModel.insertRow(2, false);

			const jsonOut: JsonMl = [
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
						[
							'row',
							['entry', { colname: 'column-0' }],
							['entry', { colname: 'column-1' }],
							['entry', { colname: 'column-2' }],
							['entry', { colname: 'column-3' }],
						],
					],
				],
			];

			const options = {
				table: {
					localName: 'table',
				},
			};

			runTest(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table, adding 1 row after index 3 (last)', () => {
			const jsonIn: JsonMl = [
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
			];

			const mutateGridModel = (gridModel) => gridModel.insertRow(3, true);

			const jsonOut: JsonMl = [
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
						[
							'row',
							['entry', { colname: 'column-0' }],
							['entry', { colname: 'column-1' }],
							['entry', { colname: 'column-2' }],
							['entry', { colname: 'column-3' }],
						],
					],
				],
			];

			const options = {
				table: {
					localName: 'table',
				},
			};

			runTest(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table, adding 1 row before index 3 (last)', () => {
			const jsonIn: JsonMl = [
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
			];

			const mutateGridModel = (gridModel) =>
				gridModel.insertRow(3, false);

			const jsonOut: JsonMl = [
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
						[
							'row',
							['entry', { colname: 'column-0' }],
							['entry', { colname: 'column-1' }],
							['entry', { colname: 'column-2' }],
							['entry', { colname: 'column-3' }],
						],
					],
				],
			];

			const options = {
				table: {
					localName: 'table',
				},
			};

			runTest(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table with 1 header row, adding 1 row before index 0', () => {
			const jsonIn: JsonMl = [
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
							['entry', { colname: 'column-0' }, 'a'],
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
			];

			const mutateGridModel = (gridModel) =>
				gridModel.insertRow(0, false);

			const jsonOut: JsonMl = [
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
						[
							'row',
							['entry', { colname: 'column-0' }, 'a'],
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
			];

			const options = {
				table: {
					localName: 'table',
				},
			};

			runTest(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table with 2 header rows, adding 1 row after index 1 (last header row)', () => {
			const jsonIn: JsonMl = [
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
					],
				],
			];

			const mutateGridModel = (gridModel) => gridModel.insertRow(1, true);

			const jsonOut: JsonMl = [
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
					],
				],
			];

			const options = {
				table: {
					localName: 'table',
				},
			};

			runTest(jsonIn, jsonOut, options, mutateGridModel);
		});
	});

	describe('Delete row', () => {
		it('can handle a 4x4 table, deleting 1 row at index 0', () => {
			const jsonIn: JsonMl = [
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
			];

			const mutateGridModel = (gridModel) => gridModel.deleteRow(1);

			const jsonOut: JsonMl = [
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
					],
				],
			];

			const options = {
				table: {
					localName: 'table',
				},
			};

			runTest(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table, deleting 1 row at index 2 (middle)', () => {
			const jsonIn: JsonMl = [
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
			];

			const mutateGridModel = (gridModel) => gridModel.deleteRow(2);

			const jsonOut: JsonMl = [
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
					],
				],
			];

			const options = {
				table: {
					localName: 'table',
				},
			};

			runTest(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table, deleting 1 row at index 3 (last)', () => {
			const jsonIn: JsonMl = [
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
			];

			const mutateGridModel = (gridModel) => gridModel.deleteRow(3);

			const jsonOut: JsonMl = [
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
					],
				],
			];

			const options = {
				table: {
					localName: 'table',
				},
			};

			runTest(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table with 1 header row, deleting 1 row at index 0', () => {
			const jsonIn: JsonMl = [
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
			];

			const mutateGridModel = (gridModel) => gridModel.deleteRow(0);

			const jsonOut: JsonMl = [
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
					],
				],
			];

			const options = {
				table: {
					localName: 'table',
				},
			};

			runTest(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table with 2 header rows, deleting 1 row at index 0 (first header row)', () => {
			const jsonIn: JsonMl = [
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
					],
				],
			];

			const mutateGridModel = (gridModel) => gridModel.deleteRow(0);

			const jsonOut: JsonMl = [
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
					],
				],
			];

			const options = {
				table: {
					localName: 'table',
				},
			};

			runTest(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table with 2 header rows, deleting 1 row at index 1 (last header row)', () => {
			const jsonIn: JsonMl = [
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
					],
				],
			];

			const mutateGridModel = (gridModel) => gridModel.deleteRow(1);

			const jsonOut: JsonMl = [
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
					],
				],
			];

			const options = {
				table: {
					localName: 'table',
				},
			};

			runTest(jsonIn, jsonOut, options, mutateGridModel);
		});
	});

	describe('Insert column', () => {
		it('can handle a 4x4 table, adding 1 column before index 0', () => {
			const jsonIn: JsonMl = [
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
			];

			const mutateGridModel = (gridModel) =>
				gridModel.insertColumn(0, false);

			const jsonOut: JsonMl = [
				'table',
				{ frame: 'all' },
				[
					'tgroup',
					{ cols: '5' },
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
						'colspec',
						{
							colname: 'column-4',
							colnum: '5',
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
							['entry', { colname: 'column-4' }],
						],
						[
							'row',
							['entry', { colname: 'column-0' }],
							['entry', { colname: 'column-1' }],
							['entry', { colname: 'column-2' }],
							['entry', { colname: 'column-3' }],
							['entry', { colname: 'column-4' }],
						],
						[
							'row',
							['entry', { colname: 'column-0' }],
							['entry', { colname: 'column-1' }],
							['entry', { colname: 'column-2' }],
							['entry', { colname: 'column-3' }],
							['entry', { colname: 'column-4' }],
						],
						[
							'row',
							['entry', { colname: 'column-0' }],
							['entry', { colname: 'column-1' }],
							['entry', { colname: 'column-2' }],
							['entry', { colname: 'column-3' }],
							['entry', { colname: 'column-4' }],
						],
					],
				],
			];

			const options = {
				table: {
					localName: 'table',
				},
			};

			runTest(jsonIn, jsonOut, options, mutateGridModel, true);
		});

		it('can handle a 4x4 table, adding 1 column before index 2', () => {
			const jsonIn: JsonMl = [
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
			];

			const mutateGridModel = (gridModel) =>
				gridModel.insertColumn(2, false);

			const jsonOut: JsonMl = [
				'table',
				{ frame: 'all' },
				[
					'tgroup',
					{ cols: '5' },
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
						'colspec',
						{
							colname: 'column-4',
							colnum: '5',
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
							['entry', { colname: 'column-4' }],
						],
						[
							'row',
							['entry', { colname: 'column-0' }],
							['entry', { colname: 'column-1' }],
							['entry', { colname: 'column-2' }],
							['entry', { colname: 'column-3' }],
							['entry', { colname: 'column-4' }],
						],
						[
							'row',
							['entry', { colname: 'column-0' }],
							['entry', { colname: 'column-1' }],
							['entry', { colname: 'column-2' }],
							['entry', { colname: 'column-3' }],
							['entry', { colname: 'column-4' }],
						],
						[
							'row',
							['entry', { colname: 'column-0' }],
							['entry', { colname: 'column-1' }],
							['entry', { colname: 'column-2' }],
							['entry', { colname: 'column-3' }],
							['entry', { colname: 'column-4' }],
						],
					],
				],
			];

			const options = {
				table: {
					localName: 'table',
				},
			};

			runTest(jsonIn, jsonOut, options, mutateGridModel, true);
		});

		it('can handle a 4x4 table, adding 1 column after index 3', () => {
			const jsonIn: JsonMl = [
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
			];

			const mutateGridModel = (gridModel) =>
				gridModel.insertColumn(3, true);

			const jsonOut: JsonMl = [
				'table',
				{ frame: 'all' },
				[
					'tgroup',
					{ cols: '5' },
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
						'colspec',
						{
							colname: 'column-4',
							colnum: '5',
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
							['entry', { colname: 'column-4' }],
						],
						[
							'row',
							['entry', { colname: 'column-0' }],
							['entry', { colname: 'column-1' }],
							['entry', { colname: 'column-2' }],
							['entry', { colname: 'column-3' }],
							['entry', { colname: 'column-4' }],
						],
						[
							'row',
							['entry', { colname: 'column-0' }],
							['entry', { colname: 'column-1' }],
							['entry', { colname: 'column-2' }],
							['entry', { colname: 'column-3' }],
							['entry', { colname: 'column-4' }],
						],
						[
							'row',
							['entry', { colname: 'column-0' }],
							['entry', { colname: 'column-1' }],
							['entry', { colname: 'column-2' }],
							['entry', { colname: 'column-3' }],
							['entry', { colname: 'column-4' }],
						],
					],
				],
			];

			const options = {
				table: {
					localName: 'table',
				},
			};

			runTest(jsonIn, jsonOut, options, mutateGridModel, true);
		});

		it('can handle a 4x4 table with 1 header row, adding 1 column before index 0', () => {
			const jsonIn: JsonMl = [
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
			];

			const mutateGridModel = (gridModel) =>
				gridModel.insertColumn(0, false);

			const jsonOut: JsonMl = [
				'table',
				{ frame: 'all' },
				[
					'tgroup',
					{ cols: '5' },
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
						'colspec',
						{
							colname: 'column-4',
							colnum: '5',
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
							['entry', { colname: 'column-4' }],
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
							['entry', { colname: 'column-4' }],
						],
						[
							'row',
							['entry', { colname: 'column-0' }],
							['entry', { colname: 'column-1' }],
							['entry', { colname: 'column-2' }],
							['entry', { colname: 'column-3' }],
							['entry', { colname: 'column-4' }],
						],
						[
							'row',
							['entry', { colname: 'column-0' }],
							['entry', { colname: 'column-1' }],
							['entry', { colname: 'column-2' }],
							['entry', { colname: 'column-3' }],
							['entry', { colname: 'column-4' }],
						],
					],
				],
			];

			const options = {
				table: {
					localName: 'table',
				},
			};

			runTest(jsonIn, jsonOut, options, mutateGridModel, true);
		});

		it('can handle a 4x4 table with 1 header row, adding 1 column before index 2', () => {
			const jsonIn: JsonMl = [
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
			];

			const mutateGridModel = (gridModel) =>
				gridModel.insertColumn(2, false);

			const jsonOut: JsonMl = [
				'table',
				{ frame: 'all' },
				[
					'tgroup',
					{ cols: '5' },
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
						'colspec',
						{
							colname: 'column-4',
							colnum: '5',
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
							['entry', { colname: 'column-4' }],
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
							['entry', { colname: 'column-4' }],
						],
						[
							'row',
							['entry', { colname: 'column-0' }],
							['entry', { colname: 'column-1' }],
							['entry', { colname: 'column-2' }],
							['entry', { colname: 'column-3' }],
							['entry', { colname: 'column-4' }],
						],
						[
							'row',
							['entry', { colname: 'column-0' }],
							['entry', { colname: 'column-1' }],
							['entry', { colname: 'column-2' }],
							['entry', { colname: 'column-3' }],
							['entry', { colname: 'column-4' }],
						],
					],
				],
			];

			const options = {
				table: {
					localName: 'table',
				},
			};

			runTest(jsonIn, jsonOut, options, mutateGridModel, true);
		});

		it('can handle a 4x4 table with 1 header row, adding 1 column after index 3', () => {
			const jsonIn: JsonMl = [
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
			];

			const mutateGridModel = (gridModel) =>
				gridModel.insertColumn(3, true);

			const jsonOut: JsonMl = [
				'table',
				{ frame: 'all' },
				[
					'tgroup',
					{ cols: '5' },
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
						'colspec',
						{
							colname: 'column-4',
							colnum: '5',
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
							['entry', { colname: 'column-4' }],
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
							['entry', { colname: 'column-4' }],
						],
						[
							'row',
							['entry', { colname: 'column-0' }],
							['entry', { colname: 'column-1' }],
							['entry', { colname: 'column-2' }],
							['entry', { colname: 'column-3' }],
							['entry', { colname: 'column-4' }],
						],
						[
							'row',
							['entry', { colname: 'column-0' }],
							['entry', { colname: 'column-1' }],
							['entry', { colname: 'column-2' }],
							['entry', { colname: 'column-3' }],
							['entry', { colname: 'column-4' }],
						],
					],
				],
			];

			const options = {
				table: {
					localName: 'table',
				},
			};

			runTest(jsonIn, jsonOut, options, mutateGridModel, true);
		});
	});

	describe('Delete column', () => {
		it('can handle a 4x4 table, deleting 1 column at index 0', () => {
			const jsonIn: JsonMl = [
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
			];

			const mutateGridModel = (gridModel) => gridModel.deleteColumn(0);

			const jsonOut: JsonMl = [
				'table',
				{ frame: 'all' },
				[
					'tgroup',
					{ cols: '3' },
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
						'tbody',
						[
							'row',
							['entry', { colname: 'column-0' }],
							['entry', { colname: 'column-1' }],
							['entry', { colname: 'column-2' }],
						],
						[
							'row',
							['entry', { colname: 'column-0' }],
							['entry', { colname: 'column-1' }],
							['entry', { colname: 'column-2' }],
						],
						[
							'row',
							['entry', { colname: 'column-0' }],
							['entry', { colname: 'column-1' }],
							['entry', { colname: 'column-2' }],
						],
						[
							'row',
							['entry', { colname: 'column-0' }],
							['entry', { colname: 'column-1' }],
							['entry', { colname: 'column-2' }],
						],
					],
				],
			];

			const options = {
				table: {
					localName: 'table',
				},
			};

			runTest(jsonIn, jsonOut, options, mutateGridModel, true);
		});

		it('can handle a 4x4 table, deleting 1 column at index 2', () => {
			const jsonIn: JsonMl = [
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
			];

			const mutateGridModel = (gridModel) => gridModel.deleteColumn(2);

			const jsonOut: JsonMl = [
				'table',
				{ frame: 'all' },
				[
					'tgroup',
					{ cols: '3' },
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
						'tbody',
						[
							'row',
							['entry', { colname: 'column-0' }],
							['entry', { colname: 'column-1' }],
							['entry', { colname: 'column-2' }],
						],
						[
							'row',
							['entry', { colname: 'column-0' }],
							['entry', { colname: 'column-1' }],
							['entry', { colname: 'column-2' }],
						],
						[
							'row',
							['entry', { colname: 'column-0' }],
							['entry', { colname: 'column-1' }],
							['entry', { colname: 'column-2' }],
						],
						[
							'row',
							['entry', { colname: 'column-0' }],
							['entry', { colname: 'column-1' }],
							['entry', { colname: 'column-2' }],
						],
					],
				],
			];

			const options = {
				table: {
					localName: 'table',
				},
			};

			runTest(jsonIn, jsonOut, options, mutateGridModel, true);
		});

		it('can handle a 4x4 table, deleting 1 column at index 3', () => {
			const jsonIn: JsonMl = [
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
			];

			const mutateGridModel = (gridModel) => gridModel.deleteColumn(3);

			const jsonOut: JsonMl = [
				'table',
				{ frame: 'all' },
				[
					'tgroup',
					{ cols: '3' },
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
						'tbody',
						[
							'row',
							['entry', { colname: 'column-0' }],
							['entry', { colname: 'column-1' }],
							['entry', { colname: 'column-2' }],
						],
						[
							'row',
							['entry', { colname: 'column-0' }],
							['entry', { colname: 'column-1' }],
							['entry', { colname: 'column-2' }],
						],
						[
							'row',
							['entry', { colname: 'column-0' }],
							['entry', { colname: 'column-1' }],
							['entry', { colname: 'column-2' }],
						],
						[
							'row',
							['entry', { colname: 'column-0' }],
							['entry', { colname: 'column-1' }],
							['entry', { colname: 'column-2' }],
						],
					],
				],
			];

			const options = {
				table: {
					localName: 'table',
				},
			};

			runTest(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table with 1 header row, deleting 1 column at index 0', () => {
			const jsonIn: JsonMl = [
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
			];

			const mutateGridModel = (gridModel) => gridModel.deleteColumn(0);

			const jsonOut: JsonMl = [
				'table',
				{ frame: 'all' },
				[
					'tgroup',
					{ cols: '3' },
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
						'thead',
						[
							'row',
							['entry', { colname: 'column-0' }],
							['entry', { colname: 'column-1' }],
							['entry', { colname: 'column-2' }],
						],
					],
					[
						'tbody',
						[
							'row',
							['entry', { colname: 'column-0' }],
							['entry', { colname: 'column-1' }],
							['entry', { colname: 'column-2' }],
						],
						[
							'row',
							['entry', { colname: 'column-0' }],
							['entry', { colname: 'column-1' }],
							['entry', { colname: 'column-2' }],
						],
						[
							'row',
							['entry', { colname: 'column-0' }],
							['entry', { colname: 'column-1' }],
							['entry', { colname: 'column-2' }],
						],
					],
				],
			];

			const options = {
				table: {
					localName: 'table',
				},
			};

			runTest(jsonIn, jsonOut, options, mutateGridModel, true);
		});

		it('can handle a 4x4 table with 1 header row, deleting 1 column at index 2', () => {
			const jsonIn: JsonMl = [
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
			];

			const mutateGridModel = (gridModel) => gridModel.deleteColumn(2);

			const jsonOut: JsonMl = [
				'table',
				{ frame: 'all' },
				[
					'tgroup',
					{ cols: '3' },
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
						'thead',
						[
							'row',
							['entry', { colname: 'column-0' }],
							['entry', { colname: 'column-1' }],
							['entry', { colname: 'column-2' }],
						],
					],
					[
						'tbody',
						[
							'row',
							['entry', { colname: 'column-0' }],
							['entry', { colname: 'column-1' }],
							['entry', { colname: 'column-2' }],
						],
						[
							'row',
							['entry', { colname: 'column-0' }],
							['entry', { colname: 'column-1' }],
							['entry', { colname: 'column-2' }],
						],
						[
							'row',
							['entry', { colname: 'column-0' }],
							['entry', { colname: 'column-1' }],
							['entry', { colname: 'column-2' }],
						],
					],
				],
			];

			const options = {
				table: {
					localName: 'table',
				},
			};

			runTest(jsonIn, jsonOut, options, mutateGridModel, true);
		});

		it('can handle a 4x4 table with 1 header row, deleting 1 column after index 3', () => {
			const jsonIn: JsonMl = [
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
			];

			const mutateGridModel = (gridModel) => gridModel.deleteColumn(3);

			const jsonOut: JsonMl = [
				'table',
				{ frame: 'all' },
				[
					'tgroup',
					{ cols: '3' },
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
						'thead',
						[
							'row',
							['entry', { colname: 'column-0' }],
							['entry', { colname: 'column-1' }],
							['entry', { colname: 'column-2' }],
						],
					],
					[
						'tbody',
						[
							'row',
							['entry', { colname: 'column-0' }],
							['entry', { colname: 'column-1' }],
							['entry', { colname: 'column-2' }],
						],
						[
							'row',
							['entry', { colname: 'column-0' }],
							['entry', { colname: 'column-1' }],
							['entry', { colname: 'column-2' }],
						],
						[
							'row',
							['entry', { colname: 'column-0' }],
							['entry', { colname: 'column-1' }],
							['entry', { colname: 'column-2' }],
						],
					],
				],
			];

			const options = {
				table: {
					localName: 'table',
				},
			};

			runTest(jsonIn, jsonOut, options, mutateGridModel);
		});
	});

	describe('Merging cells', () => {
		it('can handle a 3x3 table, merging a cell with the cell above', () => {
			const jsonIn: JsonMl = [
				'table',
				{ frame: 'all' },
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
									colname: 'column-0',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-1',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-2',
									colsep: '0',
									rowsep: '0',
								},
							],
						],
						[
							'row',
							[
								'entry',
								{
									colname: 'column-0',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-1',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-2',
									colsep: '0',
									rowsep: '0',
								},
							],
						],
						[
							'row',
							[
								'entry',
								{
									colname: 'column-0',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-1',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-2',
									colsep: '0',
									rowsep: '0',
								},
							],
						],
					],
				],
			];

			const mutateGridModel = (
				gridModel: TableGridModel,
				blueprint: Blueprint
			) => {
				mergeCellWithCellAbove(
					gridModel,
					gridModel.getCellAtCoordinates(1, 1) as TableCell,
					blueprint
				);
			};

			const jsonOut: JsonMl = [
				'table',
				{ frame: 'all' },
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
									colname: 'column-0',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-1',
									colsep: '0',
									rowsep: '0',
									morerows: '1',
								},
							],
							[
								'entry',
								{
									colname: 'column-2',
									colsep: '0',
									rowsep: '0',
								},
							],
						],
						[
							'row',
							[
								'entry',
								{
									colname: 'column-0',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-2',
									colsep: '0',
									rowsep: '0',
								},
							],
						],
						[
							'row',
							[
								'entry',
								{
									colname: 'column-0',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-1',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-2',
									colsep: '0',
									rowsep: '0',
								},
							],
						],
					],
				],
			];

			const options = {
				table: {
					localName: 'table',
				},
			};

			runTest(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 3x3 table, merging a cell with the cell to the right', () => {
			const jsonIn: JsonMl = [
				'table',
				{ frame: 'all' },
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
									colname: 'column-0',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-1',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-2',
									colsep: '0',
									rowsep: '0',
								},
							],
						],
						[
							'row',
							[
								'entry',
								{
									colname: 'column-0',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-1',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-2',
									colsep: '0',
									rowsep: '0',
								},
							],
						],
						[
							'row',
							[
								'entry',
								{
									colname: 'column-0',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-1',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-2',
									colsep: '0',
									rowsep: '0',
								},
							],
						],
					],
				],
			];

			const mutateGridModel = (
				gridModel: TableGridModel,
				blueprint: Blueprint
			) => {
				mergeCellWithCellToTheRight(
					gridModel,
					gridModel.getCellAtCoordinates(1, 1) as TableCell,
					blueprint
				);
			};

			const jsonOut: JsonMl = [
				'table',
				{ frame: 'all' },
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
									colname: 'column-0',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-1',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-2',
									colsep: '0',
									rowsep: '0',
								},
							],
						],
						[
							'row',
							[
								'entry',
								{
									colname: 'column-0',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'entry',
								{
									colsep: '0',
									rowsep: '0',
									namest: 'column-1',
									nameend: 'column-2',
								},
							],
						],
						[
							'row',
							[
								'entry',
								{
									colname: 'column-0',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-1',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-2',
									colsep: '0',
									rowsep: '0',
								},
							],
						],
					],
				],
			];

			const options = {
				table: {
					localName: 'table',
				},
			};

			runTest(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 1x3 table, merging a cell with the cell to the right, with "*" column widths', () => {
			const jsonIn: JsonMl = [
				'table',
				{ frame: 'all' },
				[
					'tgroup',
					{ cols: '3' },
					[
						'colspec',
						{
							colname: 'column-0',
							colnum: '1',
							colwidth: '*',
							colsep: '0',
							rowsep: '0',
						},
					],
					[
						'colspec',
						{
							colname: 'column-1',
							colnum: '2',
							colwidth: '1.3*',
							colsep: '0',
							rowsep: '0',
						},
					],
					[
						'colspec',
						{
							colname: 'column-2',
							colnum: '3',
							colwidth: '*',
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
									colname: 'column-0',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-1',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-2',
									colsep: '0',
									rowsep: '0',
								},
							],
						],
					],
				],
			];

			const mutateGridModel = (
				gridModel: TableGridModel,
				blueprint: Blueprint
			) => {
				mergeCellWithCellToTheRight(
					gridModel,
					gridModel.getCellAtCoordinates(0, 1) as TableCell,
					blueprint
				);
			};

			const jsonOut: JsonMl = [
				'table',
				{ frame: 'all' },
				[
					'tgroup',
					{ cols: '2' },
					[
						'colspec',
						{
							colname: 'column-0',
							colnum: '1',
							colwidth: '*',
							colsep: '0',
							rowsep: '0',
						},
					],
					[
						'colspec',
						{
							colname: 'column-1',
							colnum: '2',
							colwidth: '2.3*',
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
									colname: 'column-0',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-1',
									colsep: '0',
									rowsep: '0',
								},
							],
						],
					],
				],
			];

			const options = {
				table: {
					localName: 'table',
				},
			};

			runTest(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 1x3 table, merging a cell with the cell to the right, with absolute column widths', () => {
			const jsonIn: JsonMl = [
				'table',
				{ frame: 'all' },
				[
					'tgroup',
					{ cols: '3' },
					[
						'colspec',
						{
							colname: 'column-0',
							colnum: '1',
							colwidth: '10px',
							colsep: '0',
							rowsep: '0',
						},
					],
					[
						'colspec',
						{
							colname: 'column-1',
							colnum: '2',
							colwidth: '20px*',
							colsep: '0',
							rowsep: '0',
						},
					],
					[
						'colspec',
						{
							colname: 'column-2',
							colnum: '3',
							colwidth: '30px',
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
									colname: 'column-0',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-1',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-2',
									colsep: '0',
									rowsep: '0',
								},
							],
						],
					],
				],
			];

			const mutateGridModel = (
				gridModel: TableGridModel,
				blueprint: Blueprint
			) => {
				mergeCellWithCellToTheRight(
					gridModel,
					gridModel.getCellAtCoordinates(0, 1) as TableCell,
					blueprint
				);
			};

			const jsonOut: JsonMl = [
				'table',
				{ frame: 'all' },
				[
					'tgroup',
					{ cols: '2' },
					[
						'colspec',
						{
							colname: 'column-0',
							colnum: '1',
							colwidth: '10px',
							colsep: '0',
							rowsep: '0',
						},
					],
					[
						'colspec',
						{
							colname: 'column-1',
							colnum: '2',
							colwidth: '50px',
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
									colname: 'column-0',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-1',
									colsep: '0',
									rowsep: '0',
								},
							],
						],
					],
				],
			];

			const options = {
				table: {
					localName: 'table',
				},
			};

			runTest(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 3x3 table, merging a cell with the cell below', () => {
			const jsonIn: JsonMl = [
				'table',
				{ frame: 'all' },
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
									colname: 'column-0',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-1',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-2',
									colsep: '0',
									rowsep: '0',
								},
							],
						],
						[
							'row',
							[
								'entry',
								{
									colname: 'column-0',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-1',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-2',
									colsep: '0',
									rowsep: '0',
								},
							],
						],
						[
							'row',
							[
								'entry',
								{
									colname: 'column-0',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-1',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-2',
									colsep: '0',
									rowsep: '0',
								},
							],
						],
					],
				],
			];

			const mutateGridModel = (
				gridModel: TableGridModel,
				blueprint: Blueprint
			) => {
				mergeCellWithCellBelow(
					gridModel,
					gridModel.getCellAtCoordinates(1, 1) as TableCell,
					blueprint
				);
			};

			const jsonOut: JsonMl = [
				'table',
				{ frame: 'all' },
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
									colname: 'column-0',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-1',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-2',
									colsep: '0',
									rowsep: '0',
								},
							],
						],
						[
							'row',
							[
								'entry',
								{
									colname: 'column-0',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-1',
									colsep: '0',
									rowsep: '0',
									morerows: '1',
								},
							],
							[
								'entry',
								{
									colname: 'column-2',
									colsep: '0',
									rowsep: '0',
								},
							],
						],
						[
							'row',
							[
								'entry',
								{
									colname: 'column-0',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-2',
									colsep: '0',
									rowsep: '0',
								},
							],
						],
					],
				],
			];

			const options = {
				table: {
					localName: 'table',
				},
			};

			runTest(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 3x3 table, merging a cell with a cell to the left', () => {
			const jsonIn: JsonMl = [
				'table',
				{ frame: 'all' },
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
									colname: 'column-0',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-1',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-2',
									colsep: '0',
									rowsep: '0',
								},
							],
						],
						[
							'row',
							[
								'entry',
								{
									colname: 'column-0',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-1',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-2',
									colsep: '0',
									rowsep: '0',
								},
							],
						],
						[
							'row',
							[
								'entry',
								{
									colname: 'column-0',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-1',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-2',
									colsep: '0',
									rowsep: '0',
								},
							],
						],
					],
				],
			];

			const mutateGridModel = (
				gridModel: TableGridModel,
				blueprint: Blueprint
			) => {
				mergeCellWithCellToTheLeft(
					gridModel,
					gridModel.getCellAtCoordinates(1, 1) as TableCell,
					blueprint
				);
			};

			const jsonOut: JsonMl = [
				'table',
				{ frame: 'all' },
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
									colname: 'column-0',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-1',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-2',
									colsep: '0',
									rowsep: '0',
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
									namest: 'column-0',
									nameend: 'column-1',
								},
							],
							[
								'entry',
								{
									colname: 'column-2',
									colsep: '0',
									rowsep: '0',
								},
							],
						],
						[
							'row',
							[
								'entry',
								{
									colname: 'column-0',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-1',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-2',
									colsep: '0',
									rowsep: '0',
								},
							],
						],
					],
				],
			];

			const options = {
				table: {
					localName: 'table',
				},
			};

			runTest(jsonIn, jsonOut, options, mutateGridModel);
		});
	});

	describe('Splitting cells', () => {
		it('can handle a 3x3 table, splitting a cell spanning over rows', () => {
			const jsonIn: JsonMl = [
				'table',
				{ frame: 'all' },
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
									colname: 'column-0',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-1',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-2',
									colsep: '0',
									rowsep: '0',
								},
							],
						],
						[
							'row',
							[
								'entry',
								{
									colname: 'column-0',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-1',
									colsep: '0',
									rowsep: '0',
									morerows: '1',
								},
							],
							[
								'entry',
								{
									colname: 'column-2',
									colsep: '0',
									rowsep: '0',
								},
							],
						],
						[
							'row',
							[
								'entry',
								{
									colname: 'column-0',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-2',
									colsep: '0',
									rowsep: '0',
								},
							],
						],
					],
				],
			];

			const mutateGridModel = (gridModel) => {
				splitCellIntoRows(
					gridModel,
					gridModel.getCellAtCoordinates(1, 1)
				);
			};

			const jsonOut: JsonMl = [
				'table',
				{ frame: 'all' },
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
									colname: 'column-0',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-1',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-2',
									colsep: '0',
									rowsep: '0',
								},
							],
						],
						[
							'row',
							[
								'entry',
								{
									colname: 'column-0',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-1',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-2',
									colsep: '0',
									rowsep: '0',
								},
							],
						],
						[
							'row',
							[
								'entry',
								{
									colname: 'column-0',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-1',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-2',
									colsep: '0',
									rowsep: '0',
								},
							],
						],
					],
				],
			];

			const options = {
				table: {
					localName: 'table',
				},
			};

			runTest(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 3x3 table, splitting a cell spanning over columns', () => {
			const jsonIn: JsonMl = [
				'table',
				{ frame: 'all' },
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
									colname: 'column-0',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-1',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-2',
									colsep: '0',
									rowsep: '0',
								},
							],
						],
						[
							'row',
							[
								'entry',
								{
									colname: 'column-0',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'entry',
								{
									namest: 'column-1',
									nameend: 'column-2',
									colsep: '0',
									rowsep: '0',
								},
							],
						],
						[
							'row',
							[
								'entry',
								{
									colname: 'column-0',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-1',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-2',
									colsep: '0',
									rowsep: '0',
								},
							],
						],
					],
				],
			];

			const mutateGridModel = (gridModel) => {
				splitCellIntoColumns(
					gridModel,
					gridModel.getCellAtCoordinates(1, 1)
				);
			};

			const jsonOut: JsonMl = [
				'table',
				{ frame: 'all' },
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
									colname: 'column-0',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-1',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-2',
									colsep: '0',
									rowsep: '0',
								},
							],
						],
						[
							'row',
							[
								'entry',
								{
									colname: 'column-0',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-1',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-2',
									colsep: '0',
									rowsep: '0',
								},
							],
						],
						[
							'row',
							[
								'entry',
								{
									colname: 'column-0',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-1',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-2',
									colsep: '0',
									rowsep: '0',
								},
							],
						],
					],
				],
			];

			const options = {
				table: {
					localName: 'table',
				},
			};

			runTest(jsonIn, jsonOut, options, mutateGridModel);
		});
	});

	describe('Tables not having all the colspecs', () => {
		it('can transform a table having no colspec at all', () => {
			const jsonIn: JsonMl = [
				'table',
				{ frame: 'all' },
				[
					'tgroup',
					{ cols: '3' },
					[
						'tbody',
						['row', ['entry'], ['entry'], ['entry']],
						['row', ['entry'], ['entry'], ['entry']],
						['row', ['entry'], ['entry'], ['entry']],
					],
				],
			];

			const jsonOut: JsonMl = [
				'table',
				{ frame: 'all' },
				[
					'tgroup',
					{ cols: '3' },
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
						'tbody',
						[
							'row',
							['entry', { colname: 'column-0' }],
							['entry', { colname: 'column-1' }],
							['entry', { colname: 'column-2' }],
						],
						[
							'row',
							['entry', { colname: 'column-0' }],
							['entry', { colname: 'column-1' }],
							['entry', { colname: 'column-2' }],
						],
						[
							'row',
							['entry', { colname: 'column-0' }],
							['entry', { colname: 'column-1' }],
							['entry', { colname: 'column-2' }],
						],
					],
				],
			];

			const options = {
				table: {
					localName: 'table',
				},
			};

			runTest(jsonIn, jsonOut, options);
		});

		it('can transform a table having only 1 colspec', () => {
			const jsonIn: JsonMl = [
				'table',
				{ frame: 'all' },
				[
					'tgroup',
					{ cols: '3' },
					[
						'colspec',
						{
							colname: 'some-non-standard-colname',
							colsep: '0',
							rowsep: '0',
						},
					],
					[
						'tbody',
						[
							'row',
							['entry', { colname: 'column-0' }],
							['entry'],
							['entry'],
						],
						['row', ['entry'], ['entry'], ['entry']],
						['row', ['entry'], ['entry'], ['entry']],
					],
				],
			];

			const jsonOut: JsonMl = [
				'table',
				{ frame: 'all' },
				[
					'tgroup',
					{ cols: '3' },
					[
						'colspec',
						{
							colname: 'some-non-standard-colname',
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
						'tbody',
						[
							'row',
							[
								'entry',
								{
									colname: 'some-non-standard-colname',
									colsep: '0',
									rowsep: '0',
								},
							],
							['entry', { colname: 'column-1' }],
							['entry', { colname: 'column-2' }],
						],
						[
							'row',
							['entry', { colname: 'some-non-standard-colname' }],
							['entry', { colname: 'column-1' }],
							['entry', { colname: 'column-2' }],
						],
						[
							'row',
							['entry', { colname: 'some-non-standard-colname' }],
							['entry', { colname: 'column-1' }],
							['entry', { colname: 'column-2' }],
						],
					],
				],
			];

			const options = {
				table: {
					localName: 'table',
				},
			};

			runTest(jsonIn, jsonOut, options);
		});
	});

	describe('CALS specifics', () => {
		it('can handle a 3x3 table, merging a cell with the cell below', () => {
			const jsonIn: JsonMl = [
				'table',
				{ frame: 'all' },
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
									colname: 'column-0',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-1',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-2',
									colsep: '0',
									rowsep: '0',
								},
							],
						],
						[
							'row',
							[
								'entry',
								{
									colname: 'column-0',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-1',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-2',
									colsep: '0',
									rowsep: '0',
								},
							],
						],
						[
							'row',
							[
								'entry',
								{
									colname: 'column-0',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-1',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-2',
									colsep: '0',
									rowsep: '0',
								},
							],
						],
					],
				],
			];

			const mutateGridModel = (
				gridModel: TableGridModel,
				blueprint: Blueprint
			) => {
				mergeCellWithCellBelow(
					gridModel,
					gridModel.getCellAtCoordinates(1, 0) as TableCell,
					blueprint
				);
				mergeCellWithCellBelow(
					gridModel,
					gridModel.getCellAtCoordinates(1, 1) as TableCell,
					blueprint
				);
				mergeCellWithCellBelow(
					gridModel,
					gridModel.getCellAtCoordinates(1, 2) as TableCell,
					blueprint
				);
			};

			const jsonOut: JsonMl = [
				'table',
				{ frame: 'all' },
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
									colname: 'column-0',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-1',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-2',
									colsep: '0',
									rowsep: '0',
								},
							],
						],
						[
							'row',
							[
								'entry',
								{
									colname: 'column-0',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-1',
									colsep: '0',
									rowsep: '0',
								},
							],
							[
								'entry',
								{
									colname: 'column-2',
									colsep: '0',
									rowsep: '0',
								},
							],
						],
					],
				],
			];

			const options = {
				table: {
					localName: 'table',
				},
			};

			runTest(jsonIn, jsonOut, options, mutateGridModel);
		});
	});
});
