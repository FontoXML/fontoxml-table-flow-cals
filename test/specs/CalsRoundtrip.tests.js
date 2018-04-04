import blueprints from 'fontoxml-blueprints';
import core from 'fontoxml-core';
import jsonMLMapper from 'fontoxml-dom-utils/jsonMLMapper';
import * as slimdom from 'slimdom';

import CalsTableDefinition from 'fontoxml-table-flow-cals/table-definition/CalsTableDefinition';

import mergeCells from 'fontoxml-table-flow/TableGridModel/mutations/merging/mergeCells';
import splitSpanningCell from 'fontoxml-table-flow/TableGridModel/mutations/splitting/splitSpanningCell';

const mergeCellWithCellToTheRight = mergeCells.mergeCellWithCellToTheRight;
const mergeCellWithCellToTheLeft = mergeCells.mergeCellWithCellToTheLeft;
const mergeCellWithCellBelow = mergeCells.mergeCellWithCellBelow;
const mergeCellWithCellAbove = mergeCells.mergeCellWithCellAbove;

const splitCellIntoRows = splitSpanningCell.splitCellIntoRows;
const splitCellIntoColumns = splitSpanningCell.splitCellIntoColumns;

const Blueprint = blueprints.Blueprint;
const CoreDocument = core.Document;

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

describe('CALS tables: XML to XML roundtrip', () => {
	let documentNode;
	let coreDocument;
	let blueprint;

	beforeEach(() => {
		documentNode = new slimdom.Document();
		coreDocument = new CoreDocument(documentNode);

		blueprint = new Blueprint(coreDocument.dom);
	});

	function transformTable (jsonIn, jsonOut, options = {}, mutateGridModel = () => {}) {
		coreDocument.dom.mutate(() => jsonMLMapper.parse(jsonIn, documentNode));

		const tableDefinition = new CalsTableDefinition(options);
		const tableNode = documentNode.firstChild;
		const gridModel = tableDefinition.buildTableGridModel(tableNode, blueprint);
		chai.assert.isOk(gridModel);

		mutateGridModel(gridModel);

		const success = tableDefinition.applyToDom(gridModel, tableNode, blueprint, stubFormat);
		chai.assert.isTrue(success);

		blueprint.realize();
		chai.assert.deepEqual(jsonMLMapper.serialize(documentNode.firstChild), jsonOut);
	}

	describe('Without changes', () => {
		it('can handle a 1x1 table, changing nothing', () => {
			const jsonIn = ['table',
				{ 'frame': 'all' },
				['tgroup',
					{ 'cols': '1' },
					['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['tbody',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }]
						]
					]
				]
			];

			const jsonOut = ['table',
				{ 'frame': 'all' },
				['tgroup',
					{ 'cols': '1' },
					['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['tbody',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }]
						]
					]
				]
			];

			const options = {
				table: {
					localName: 'table'
				}
			};

			transformTable(jsonIn, jsonOut, options);
		});

		it('can handle a 4x4 table, changing nothing', () => {
			const jsonIn = ['table',
				{ 'frame': 'all' },
				['tgroup',
					{ 'cols': '4' },
					['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-3', 'colnum': '4', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['tbody',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }
						]]
					]
				]
			];

			const jsonOut = ['table',
				{ 'frame': 'all' },
				['tgroup',
					{ 'cols': '4' },
					['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-3', 'colnum': '4', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['tbody',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }
						]]
					]
				]
			];

			const options = {
				table: {
					localName: 'table'
				}
			};

			transformTable(jsonIn, jsonOut, options);
		});
	});

	describe('Header rows', () => {
		it('can handle a 4x4 table, increasing header row count by 1', () => {
			const jsonIn = ['table',
				{ 'frame': 'all' },
				['tgroup',
					{ 'cols': '4' },
					['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-3', 'colnum': '4', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['tbody',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }
						]]
					]
				]
			];

			const mutateGridModel = (gridModel) => gridModel.increaseHeaderRowCount(1);

			const jsonOut = ['table',
				{ 'frame': 'all' },
				['tgroup',
					{ 'cols': '4' },
					['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-3', 'colnum': '4', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['thead',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						]
					],
					['tbody',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }
						]]
					]
				]
			];

			const options = {
				table: {
					localName: 'table'
				}
			};

			transformTable(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table with 1 header row, increasing header row count by 1', () => {
			const jsonIn = ['table',
				{ 'frame': 'all' },
				['tgroup',
					{ 'cols': '4' },
					['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-3', 'colnum': '4', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['thead',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						]
					],
					['tbody',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }
						]]
					]
				]
			];

			const mutateGridModel = (gridModel) => gridModel.increaseHeaderRowCount(1);

			const jsonOut = ['table',
				{ 'frame': 'all' },
				['tgroup',
					{ 'cols': '4' },
					['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-3', 'colnum': '4', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['thead',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
					],
					['tbody',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }
						]]
					]
				]
			];

			const options = {
				table: {
					localName: 'table'
				}
			};

			transformTable(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table with 1 header row, decreasing header row count by 1', () => {
			const jsonIn = ['table',
				{ 'frame': 'all' },
				['tgroup',
					{ 'cols': '4' },
					['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-3', 'colnum': '4', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['thead',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						]
					],
					['tbody',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }
						]]
					]
				]
			];

			const mutateGridModel = (gridModel) => gridModel.decreaseHeaderRowCount();

			const jsonOut = ['table',
				{ 'frame': 'all' },
				['tgroup',
					{ 'cols': '4' },
					['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-3', 'colnum': '4', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['tbody',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }
						]]
					]
				]
			];

			const options = {
				table: {
					localName: 'table'
				}
			};

			transformTable(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table with 2 header rows, decreasing header row count by 1', () => {
			const jsonIn = ['table',
				{ 'frame': 'all' },
				['tgroup',
					{ 'cols': '4' },
					['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-3', 'colnum': '4', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['thead',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						]
					],
					['tbody',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }
						]]
					]
				]
			];

			const mutateGridModel = (gridModel) => gridModel.decreaseHeaderRowCount();

			const jsonOut = ['table',
				{ 'frame': 'all' },
				['tgroup',
					{ 'cols': '4' },
					['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-3', 'colnum': '4', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['thead',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						]
					],
					['tbody',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }
						]]
					]
				]
			];

			const options = {
				table: {
					localName: 'table'
				}
			};

			transformTable(jsonIn, jsonOut, options, mutateGridModel);
		});
	});

	describe('Insert row', () => {
		it('can handle a 4x4 table, adding 1 row before index 0', () => {
			const jsonIn = ['table',
				{ 'frame': 'all' },
				['tgroup',
					{ 'cols': '4' },
					['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-3', 'colnum': '4', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['tbody',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }
						]]
					]
				]
			];

			const mutateGridModel = (gridModel) => gridModel.insertRow(0, false);

			const jsonOut = ['table',
				{ 'frame': 'all' },
				['tgroup',
					{ 'cols': '4' },
					['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-3', 'colnum': '4', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['tbody',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }
						]]
					]
				]
			];

			const options = {
				table: {
					localName: 'table'
				}
			};

			transformTable(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table, adding 1 row before index 2 (middle)', () => {
			const jsonIn = ['table',
				{ 'frame': 'all' },
				['tgroup',
					{ 'cols': '4' },
					['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-3', 'colnum': '4', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['tbody',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }
						]]
					]
				]
			];

			const mutateGridModel = (gridModel) => gridModel.insertRow(2, false);

			const jsonOut = ['table',
				{ 'frame': 'all' },
				['tgroup',
					{ 'cols': '4' },
					['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-3', 'colnum': '4', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['tbody',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }
						]]
					]
				]
			];

			const options = {
				table: {
					localName: 'table'
				}
			};

			transformTable(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table, adding 1 row after index 3 (last)', () => {
			const jsonIn = ['table',
				{ 'frame': 'all' },
				['tgroup',
					{ 'cols': '4' },
					['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-3', 'colnum': '4', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['tbody',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }
						]]
					]
				]
			];

			const mutateGridModel = (gridModel) => gridModel.insertRow(3, true);

			const jsonOut = ['table',
				{ 'frame': 'all' },
				['tgroup',
					{ 'cols': '4' },
					['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-3', 'colnum': '4', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['tbody',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }
						]]
					]
				]
			];

			const options = {
				table: {
					localName: 'table'
				}
			};

			transformTable(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table, adding 1 row before index 3 (last)', () => {
			const jsonIn = ['table',
				{ 'frame': 'all' },
				['tgroup',
					{ 'cols': '4' },
					['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-3', 'colnum': '4', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['tbody',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }
						]]
					]
				]
			];

			const mutateGridModel = (gridModel) => gridModel.insertRow(3, false);

			const jsonOut = ['table',
				{ 'frame': 'all' },
				['tgroup',
					{ 'cols': '4' },
					['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-3', 'colnum': '4', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['tbody',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }
						]]
					]
				]
			];

			const options = {
				table: {
					localName: 'table'
				}
			};

			transformTable(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table with 1 header row, adding 1 row before index 0', () => {
			const jsonIn = ['table',
				{ 'frame': 'all' },
				['tgroup',
					{ 'cols': '4' },
					['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-3', 'colnum': '4', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['thead',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }, 'a'],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						]
					],
					['tbody',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }
						]]
					]
				]
			];

			const mutateGridModel = (gridModel) => gridModel.insertRow(0, false);

			const jsonOut = ['table',
				{ 'frame': 'all' },
				['tgroup',
					{ 'cols': '4' },
					['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-3', 'colnum': '4', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['thead',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }, 'a'],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						]
					],
					['tbody',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }
						]]
					]
				]
			];

			const options = {
				table: {
					localName: 'table'
				}
			};

			transformTable(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table with 2 header rows, adding 1 row after index 1 (last header row)', () => {
			const jsonIn = ['table',
				{ 'frame': 'all' },
				['tgroup',
					{ 'cols': '4' },
					['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-3', 'colnum': '4', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['thead',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						]
					],
					['tbody',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }
						]]
					]
				]
			];

			const mutateGridModel = (gridModel) => gridModel.insertRow(1, true);

			const jsonOut = ['table',
				{ 'frame': 'all' },
				['tgroup',
					{ 'cols': '4' },
					['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-3', 'colnum': '4', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['thead',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						]
					],
					['tbody',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }
						]]
					]
				]
			];

			const options = {
				table: {
					localName: 'table'
				}
			};

			transformTable(jsonIn, jsonOut, options, mutateGridModel);
		});
	});

	describe('Delete row', () => {
		it('can handle a 4x4 table, deleting 1 row at index 0', () => {
			const jsonIn = ['table',
				{ 'frame': 'all' },
				['tgroup',
					{ 'cols': '4' },
					['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-3', 'colnum': '4', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['tbody',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }
						]]
					]
				]
			];

			const mutateGridModel = (gridModel) => gridModel.deleteRow(1);

			const jsonOut = ['table',
				{ 'frame': 'all' },
				['tgroup',
					{ 'cols': '4' },
					['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-3', 'colnum': '4', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['tbody',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }
						]]
					]
				]
			];

			const options = {
				table: {
					localName: 'table'
				}
			};

			transformTable(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table, deleting 1 row at index 2 (middle)', () => {
			const jsonIn = ['table',
				{ 'frame': 'all' },
				['tgroup',
					{ 'cols': '4' },
					['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-3', 'colnum': '4', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['tbody',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }
						]]
					]
				]
			];

			const mutateGridModel = (gridModel) => gridModel.deleteRow(2);

			const jsonOut = ['table',
				{ 'frame': 'all' },
				['tgroup',
					{ 'cols': '4' },
					['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-3', 'colnum': '4', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['tbody',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }
						]]
					]
				]
			];

			const options = {
				table: {
					localName: 'table'
				}
			};

			transformTable(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table, deleting 1 row at index 3 (last)', () => {
			const jsonIn = ['table',
				{ 'frame': 'all' },
				['tgroup',
					{ 'cols': '4' },
					['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-3', 'colnum': '4', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['tbody',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }
						]]
					]
				]
			];

			const mutateGridModel = (gridModel) => gridModel.deleteRow(3);

			const jsonOut = ['table',
				{ 'frame': 'all' },
				['tgroup',
					{ 'cols': '4' },
					['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-3', 'colnum': '4', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['tbody',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }
						]]
					]
				]
			];

			const options = {
				table: {
					localName: 'table'
				}
			};

			transformTable(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table with 1 header row, deleting 1 row at index 0', () => {
			const jsonIn = ['table',
				{ 'frame': 'all' },
				['tgroup',
					{ 'cols': '4' },
					['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-3', 'colnum': '4', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['thead',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						]
					],
					['tbody',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }
						]]
					]
				]
			];

			const mutateGridModel = (gridModel) => gridModel.deleteRow(0);

			const jsonOut = ['table',
				{ 'frame': 'all' },
				['tgroup',
					{ 'cols': '4' },
					['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-3', 'colnum': '4', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['tbody',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }
						]]
					]
				]
			];

			const options = {
				table: {
					localName: 'table'
				}
			};

			transformTable(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table with 2 header rows, deleting 1 row at index 0 (first header row)', () => {
			const jsonIn = ['table',
				{ 'frame': 'all' },
				['tgroup',
					{ 'cols': '4' },
					['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-3', 'colnum': '4', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['thead',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						]
					],
					['tbody',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }
						]]
					]
				]
			];

			const mutateGridModel = (gridModel) => gridModel.deleteRow(0);

			const jsonOut = ['table',
				{ 'frame': 'all' },
				['tgroup',
					{ 'cols': '4' },
					['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-3', 'colnum': '4', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['thead',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						]
					],
					['tbody',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }
						]]
					]
				]
			];

			const options = {
				table: {
					localName: 'table'
				}
			};

			transformTable(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table with 2 header rows, deleting 1 row at index 1 (last header row)', () => {
			const jsonIn = ['table',
				{ 'frame': 'all' },
				['tgroup',
					{ 'cols': '4' },
					['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-3', 'colnum': '4', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['thead',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						]
					],
					['tbody',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }
						]]
					]
				]
			];

			const mutateGridModel = (gridModel) => gridModel.deleteRow(1);

			const jsonOut = ['table',
				{ 'frame': 'all' },
				['tgroup',
					{ 'cols': '4' },
					['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-3', 'colnum': '4', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['thead',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						]
					],
					['tbody',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }
						]]
					]
				]
			];

			const options = {
				table: {
					localName: 'table'
				}
			};

			transformTable(jsonIn, jsonOut, options, mutateGridModel);
		});
	});

	describe('Insert column', () => {
		it('can handle a 4x4 table, adding 1 column before index 0', () => {
			const jsonIn = ['table',
				{ 'frame': 'all' },
				['tgroup',
					{ 'cols': '4' },
					['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-3', 'colnum': '4', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['tbody',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }
						]]
					]
				]
			];

			const mutateGridModel = (gridModel) => gridModel.insertColumn(0, false);

			const jsonOut = ['table',
				{ 'frame': 'all' },
				['tgroup',
					{ 'cols': '5' },
					['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-3', 'colnum': '4', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-4', 'colnum': '5', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['tbody',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-4', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-4', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-4', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-4', 'colsep': '1', 'rowsep': '1' }]
						]
					]
				]
			];

			const options = {
				table: {
					localName: 'table'
				}
			};

			transformTable(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table, adding 1 column before index 2', () => {
			const jsonIn = ['table',
				{ 'frame': 'all' },
				['tgroup',
					{ 'cols': '4' },
					['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-3', 'colnum': '4', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['tbody',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }
						]]
					]
				]
			];

			const mutateGridModel = (gridModel) => gridModel.insertColumn(2, false);

			const jsonOut = ['table',
				{ 'frame': 'all' },
				['tgroup',
					{ 'cols': '5' },
					['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-3', 'colnum': '4', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-4', 'colnum': '5', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['tbody',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-4', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-4', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-4', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-4', 'colsep': '1', 'rowsep': '1' }]
						]
					]
				]
			];

			const options = {
				table: {
					localName: 'table'
				}
			};

			transformTable(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table, adding 1 column after index 3', () => {
			const jsonIn = ['table',
				{ 'frame': 'all' },
				['tgroup',
					{ 'cols': '4' },
					['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-3', 'colnum': '4', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['tbody',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }
						]]
					]
				]
			];

			const mutateGridModel = (gridModel) => gridModel.insertColumn(3, true);

			const jsonOut = ['table',
				{ 'frame': 'all' },
				['tgroup',
					{ 'cols': '5' },
					['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-3', 'colnum': '4', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-4', 'colnum': '5', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['tbody',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-4', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-4', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-4', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-4', 'colsep': '1', 'rowsep': '1' }]
						]
					]
				]
			];

			const options = {
				table: {
					localName: 'table'
				}
			};

			transformTable(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table with 1 header row, adding 1 column before index 0', () => {
			const jsonIn = ['table',
				{ 'frame': 'all' },
				['tgroup',
					{ 'cols': '4' },
					['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-3', 'colnum': '4', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['thead',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
					],
					['tbody',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }
						]]
					]
				]
			];

			const mutateGridModel = (gridModel) => gridModel.insertColumn(0, false);

			const jsonOut = ['table',
				{ 'frame': 'all' },
				['tgroup',
					{ 'cols': '5' },
					['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-3', 'colnum': '4', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-4', 'colnum': '5', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['thead',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-4', 'colsep': '1', 'rowsep': '1' }]
						],
					],
					['tbody',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-4', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-4', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-4', 'colsep': '1', 'rowsep': '1' }]
						]
					]
				]
			];

			const options = {
				table: {
					localName: 'table'
				}
			};

			transformTable(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table with 1 header row, adding 1 column before index 2', () => {
			const jsonIn = ['table',
				{ 'frame': 'all' },
				['tgroup',
					{ 'cols': '4' },
					['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-3', 'colnum': '4', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['thead',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
					],
					['tbody',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }
						]]
					]
				]
			];

			const mutateGridModel = (gridModel) => gridModel.insertColumn(2, false);

			const jsonOut = ['table',
				{ 'frame': 'all' },
				['tgroup',
					{ 'cols': '5' },
					['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-3', 'colnum': '4', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-4', 'colnum': '5', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['thead',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-4', 'colsep': '1', 'rowsep': '1' }]
						],
					],
					['tbody',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-4', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-4', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-4', 'colsep': '1', 'rowsep': '1' }]
						]
					]
				]
			];

			const options = {
				table: {
					localName: 'table'
				}
			};

			transformTable(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table with 1 header row, adding 1 column after index 3', () => {
			const jsonIn = ['table',
				{ 'frame': 'all' },
				['tgroup',
					{ 'cols': '4' },
					['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-3', 'colnum': '4', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['thead',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
					],
					['tbody',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }
						]]
					]
				]
			];

			const mutateGridModel = (gridModel) => gridModel.insertColumn(3, true);

			const jsonOut = ['table',
				{ 'frame': 'all' },
				['tgroup',
					{ 'cols': '5' },
					['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-3', 'colnum': '4', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-4', 'colnum': '5', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['thead',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-4', 'colsep': '1', 'rowsep': '1' }]
						],
					],
					['tbody',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-4', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-4', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-4', 'colsep': '1', 'rowsep': '1' }]
						]
					]
				]
			];

			const options = {
				table: {
					localName: 'table'
				}
			};

			transformTable(jsonIn, jsonOut, options, mutateGridModel);
		});
	});

	describe('Delete column', () => {
		it('can handle a 4x4 table, deleting 1 column at index 0', () => {
			const jsonIn = ['table',
				{ 'frame': 'all' },
				['tgroup',
					{ 'cols': '4' },
					['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-3', 'colnum': '4', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['tbody',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						]
					]
				]
			];

			const mutateGridModel = (gridModel) => gridModel.deleteColumn(0);

			const jsonOut = ['table',
				{ 'frame': 'all' },
				['tgroup',
					{ 'cols': '3' },
					['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['tbody',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }]
						]
					]
				]
			];

			const options = {
				table: {
					localName: 'table'
				}
			};

			transformTable(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table, deleting 1 column at index 2', () => {
			const jsonIn = ['table',
				{ 'frame': 'all' },
				['tgroup',
					{ 'cols': '4' },
					['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-3', 'colnum': '4', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['tbody',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						]
					]
				]
			];

			const mutateGridModel = (gridModel) => gridModel.deleteColumn(2);

			const jsonOut = ['table',
				{ 'frame': 'all' },
				['tgroup',
					{ 'cols': '3' },
					['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['tbody',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }]
						]
					]
				]
			];

			const options = {
				table: {
					localName: 'table'
				}
			};

			transformTable(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table, deleting 1 column at index 3', () => {
			const jsonIn = ['table',
				{ 'frame': 'all' },
				['tgroup',
					{ 'cols': '4' },
					['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-3', 'colnum': '4', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['tbody',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }
						]]
					]
				]
			];

			const mutateGridModel = (gridModel) => gridModel.deleteColumn(3);

			const jsonOut = ['table',
				{ 'frame': 'all' },
				['tgroup',
					{ 'cols': '3' },
					['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['tbody',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }]
						]
					]
				]
			];

			const options = {
				table: {
					localName: 'table'
				}
			};

			transformTable(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table with 1 header row, deleting 1 column at index 0', () => {
			const jsonIn = ['table',
				{ 'frame': 'all' },
				['tgroup',
					{ 'cols': '4' },
					['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-3', 'colnum': '4', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['thead',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
					],
					['tbody',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }
						]]
					]
				]
			];

			const mutateGridModel = (gridModel) => gridModel.deleteColumn(0);

			const jsonOut = ['table',
				{ 'frame': 'all' },
				['tgroup',
					{ 'cols': '3' },
					['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['thead',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }]
						],
					],
					['tbody',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }]
						]
					]
				]
			];

			const options = {
				table: {
					localName: 'table'
				}
			};

			transformTable(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table with 1 header row, deleting 1 column at index 2', () => {
			const jsonIn = ['table',
				{ 'frame': 'all' },
				['tgroup',
					{ 'cols': '4' },
					['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-3', 'colnum': '4', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['thead',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
					],
					['tbody',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }
						]]
					]
				]
			];

			const mutateGridModel = (gridModel) => gridModel.deleteColumn(2);

			const jsonOut = ['table',
				{ 'frame': 'all' },
				['tgroup',
					{ 'cols': '3' },
					['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['thead',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }]
						],
					],
					['tbody',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }]
						]
					]
				]
			];

			const options = {
				table: {
					localName: 'table'
				}
			};

			transformTable(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table with 1 header row, deleting 1 column after index 3', () => {
			const jsonIn = ['table',
				{ 'frame': 'all' },
				['tgroup',
					{ 'cols': '4' },
					['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-3', 'colnum': '4', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['thead',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
					],
					['tbody',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-3', 'colsep': '1', 'rowsep': '1' }
						]]
					]
				]
			];

			const mutateGridModel = (gridModel) => gridModel.deleteColumn(3);

			const jsonOut = ['table',
				{ 'frame': 'all' },
				['tgroup',
					{ 'cols': '3' },
					['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['thead',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }]
						],
					],
					['tbody',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }]
						]
					]
				]
			];

			const options = {
				table: {
					localName: 'table'
				}
			};

			transformTable(jsonIn, jsonOut, options, mutateGridModel);
		});
	});

	describe('Merging cells', () => {
		it('can handle a 3x3 table, merging a cell with the cell above', () => {
			const jsonIn = ['tgroup',
				{ 'cols': '3' },
				['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '0', 'rowsep': '0' }],
				['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '1*', 'colsep': '0', 'rowsep': '0' }],
				['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '1*', 'colsep': '0', 'rowsep': '0' }],
				['tbody',
					['row',
						['entry', { 'colname': 'column-0', 'colsep': '0', 'rowsep': '0' }],
						['entry', { 'colname': 'column-1', 'colsep': '0', 'rowsep': '0' }],
						['entry', { 'colname': 'column-2', 'colsep': '0', 'rowsep': '0' }]
					],
					['row',
						['entry', { 'colname': 'column-0', 'colsep': '0', 'rowsep': '0' }],
						['entry', { 'colname': 'column-1', 'colsep': '0', 'rowsep': '0' }],
						['entry', { 'colname': 'column-2', 'colsep': '0', 'rowsep': '0' }]
					],
					['row',
						['entry', { 'colname': 'column-0', 'colsep': '0', 'rowsep': '0' }],
						['entry', { 'colname': 'column-1', 'colsep': '0', 'rowsep': '0' }],
						['entry', { 'colname': 'column-2', 'colsep': '0', 'rowsep': '0' }]
					]
				]
			];

			const mutateGridModel = (gridModel) =>
				mergeCellWithCellAbove(gridModel, gridModel.getCellAtCoordinates(1, 1), blueprint);

			const jsonOut = ['tgroup',
				{ 'cols': '3' },
				['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '0', 'rowsep': '0' }],
				['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '1*', 'colsep': '0', 'rowsep': '0' }],
				['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '1*', 'colsep': '0', 'rowsep': '0' }],
				['tbody',
					['row',
						['entry', { 'colname': 'column-0', 'colsep': '0', 'rowsep': '0' }],
						['entry', { 'colname': 'column-1', 'colsep': '0', 'rowsep': '0', 'morerows': '1' }],
						['entry', { 'colname': 'column-2', 'colsep': '0', 'rowsep': '0' }]
					],
					['row',
						['entry', { 'colname': 'column-0', 'colsep': '0', 'rowsep': '0' }],
						['entry', { 'colname': 'column-2', 'colsep': '0', 'rowsep': '0' }]
					],
					['row',
						['entry', { 'colname': 'column-0', 'colsep': '0', 'rowsep': '0' }],
						['entry', { 'colname': 'column-1', 'colsep': '0', 'rowsep': '0' }],
						['entry', { 'colname': 'column-2', 'colsep': '0', 'rowsep': '0' }]
					]
				]
			];

			const options = {
				table: {
					localName: 'table'
				}
			};

			transformTable(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 3x3 table, merging a cell with the cell to the right', () => {
			const jsonIn = ['tgroup',
				{ 'cols': '3' },
				['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '0', 'rowsep': '0' }],
				['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '1*', 'colsep': '0', 'rowsep': '0' }],
				['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '1*', 'colsep': '0', 'rowsep': '0' }],
				['tbody',
					['row',
						['entry', { 'colname': 'column-0', 'colsep': '0', 'rowsep': '0' }],
						['entry', { 'colname': 'column-1', 'colsep': '0', 'rowsep': '0' }],
						['entry', { 'colname': 'column-2', 'colsep': '0', 'rowsep': '0' }]
					],
					['row',
						['entry', { 'colname': 'column-0', 'colsep': '0', 'rowsep': '0' }],
						['entry', { 'colname': 'column-1', 'colsep': '0', 'rowsep': '0' }],
						['entry', { 'colname': 'column-2', 'colsep': '0', 'rowsep': '0' }]
					],
					['row',
						['entry', { 'colname': 'column-0', 'colsep': '0', 'rowsep': '0' }],
						['entry', { 'colname': 'column-1', 'colsep': '0', 'rowsep': '0' }],
						['entry', { 'colname': 'column-2', 'colsep': '0', 'rowsep': '0' }]
					]
				]
			];

			const mutateGridModel = (gridModel) =>
				mergeCellWithCellToTheRight(gridModel, gridModel.getCellAtCoordinates(1, 1), blueprint);

			const jsonOut = ['tgroup',
				{ 'cols': '3' },
				['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '0', 'rowsep': '0' }],
				['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '1*', 'colsep': '0', 'rowsep': '0' }],
				['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '1*', 'colsep': '0', 'rowsep': '0' }],
				['tbody',
					['row',
						['entry', { 'colname': 'column-0', 'colsep': '0', 'rowsep': '0' }],
						['entry', { 'colname': 'column-1', 'colsep': '0', 'rowsep': '0' }],
						['entry', { 'colname': 'column-2', 'colsep': '0', 'rowsep': '0' }]
					],
					['row',
						['entry', { 'colname': 'column-0', 'colsep': '0', 'rowsep': '0' }],
						['entry', { 'colsep': '0', 'rowsep': '0', 'namest': 'column-1', 'nameend': 'column-2' }]
					],
					['row',
						['entry', { 'colname': 'column-0', 'colsep': '0', 'rowsep': '0' }],
						['entry', { 'colname': 'column-1', 'colsep': '0', 'rowsep': '0' }],
						['entry', { 'colname': 'column-2', 'colsep': '0', 'rowsep': '0' }]
					]
				]
			];

			const options = {
				table: {
					localName: 'table'
				}
			};

			transformTable(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 1x3 table, merging a cell with the cell to the right, with "*" column widths', () => {
			const jsonIn = ['tgroup',
				{ 'cols': '3' },
				['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '*', 'colsep': '0', 'rowsep': '0' }],
				['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '1.3*', 'colsep': '0', 'rowsep': '0' }],
				['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '*', 'colsep': '0', 'rowsep': '0' }],
				['tbody',
					['row',
						['entry', { 'colname': 'column-0', 'colsep': '0', 'rowsep': '0' }],
						['entry', { 'colname': 'column-1', 'colsep': '0', 'rowsep': '0' }],
						['entry', { 'colname': 'column-2', 'colsep': '0', 'rowsep': '0' }]
					]
				]
			];

			const mutateGridModel = (gridModel) =>
				mergeCellWithCellToTheRight(gridModel, gridModel.getCellAtCoordinates(0, 1), blueprint);

			const jsonOut = ['tgroup',
				{ 'cols': '2' },
				['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '*', 'colsep': '0', 'rowsep': '0' }],
				['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '2.3*', 'colsep': '0', 'rowsep': '0' }],
				['tbody',
					['row',
						['entry', { 'colname': 'column-0', 'colsep': '0', 'rowsep': '0' }],
						['entry', { 'colname': 'column-1', 'colsep': '0', 'rowsep': '0' }]
					]
				]
			];

			const options = {
				table: {
					localName: 'table'
				}
			};

			transformTable(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 1x3 table, merging a cell with the cell to the right, with absolute column widths', () => {
			const jsonIn = ['tgroup',
				{ 'cols': '3' },
				['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '10px', 'colsep': '0', 'rowsep': '0' }],
				['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '20px*', 'colsep': '0', 'rowsep': '0' }],
				['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '30px', 'colsep': '0', 'rowsep': '0' }],
				['tbody',
					['row',
						['entry', { 'colname': 'column-0', 'colsep': '0', 'rowsep': '0' }],
						['entry', { 'colname': 'column-1', 'colsep': '0', 'rowsep': '0' }],
						['entry', { 'colname': 'column-2', 'colsep': '0', 'rowsep': '0' }]
					]
				]
			];

			const mutateGridModel = (gridModel) =>
				mergeCellWithCellToTheRight(gridModel, gridModel.getCellAtCoordinates(0, 1), blueprint);

			const jsonOut = ['tgroup',
				{ 'cols': '2' },
				['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '10px', 'colsep': '0', 'rowsep': '0' }],
				['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '50px', 'colsep': '0', 'rowsep': '0' }],
				['tbody',
					['row',
						['entry', { 'colname': 'column-0', 'colsep': '0', 'rowsep': '0' }],
						['entry', { 'colname': 'column-1', 'colsep': '0', 'rowsep': '0' }]
					]
				]
			];

			const options = {
				table: {
					localName: 'table'
				}
			};

			transformTable(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 3x3 table, merging a cell with the cell below', () => {
			const jsonIn = ['tgroup',
				{ 'cols': '3' },
				['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '0', 'rowsep': '0' }],
				['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '1*', 'colsep': '0', 'rowsep': '0' }],
				['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '1*', 'colsep': '0', 'rowsep': '0' }],
				['tbody',
					['row',
						['entry', { 'colname': 'column-0', 'colsep': '0', 'rowsep': '0' }],
						['entry', { 'colname': 'column-1', 'colsep': '0', 'rowsep': '0' }],
						['entry', { 'colname': 'column-2', 'colsep': '0', 'rowsep': '0' }]
					],
					['row',
						['entry', { 'colname': 'column-0', 'colsep': '0', 'rowsep': '0' }],
						['entry', { 'colname': 'column-1', 'colsep': '0', 'rowsep': '0' }],
						['entry', { 'colname': 'column-2', 'colsep': '0', 'rowsep': '0' }]
					],
					['row',
						['entry', { 'colname': 'column-0', 'colsep': '0', 'rowsep': '0' }],
						['entry', { 'colname': 'column-1', 'colsep': '0', 'rowsep': '0' }],
						['entry', { 'colname': 'column-2', 'colsep': '0', 'rowsep': '0' }]
					]
				]
			];

			const mutateGridModel = (gridModel) =>
				mergeCellWithCellBelow(gridModel, gridModel.getCellAtCoordinates(1, 1), blueprint);

			const jsonOut = ['tgroup',
				{ 'cols': '3' },
				['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '0', 'rowsep': '0' }],
				['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '1*', 'colsep': '0', 'rowsep': '0' }],
				['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '1*', 'colsep': '0', 'rowsep': '0' }],
				['tbody',
					['row',
						['entry', { 'colname': 'column-0', 'colsep': '0', 'rowsep': '0' }],
						['entry', { 'colname': 'column-1', 'colsep': '0', 'rowsep': '0' }],
						['entry', { 'colname': 'column-2', 'colsep': '0', 'rowsep': '0' }]
					],
					['row',
						['entry', { 'colname': 'column-0', 'colsep': '0', 'rowsep': '0' }],
						['entry', { 'colname': 'column-1', 'colsep': '0', 'rowsep': '0', 'morerows': '1' }],
						['entry', { 'colname': 'column-2', 'colsep': '0', 'rowsep': '0' }]
					],
					['row',
						['entry', { 'colname': 'column-0', 'colsep': '0', 'rowsep': '0' }],
						['entry', { 'colname': 'column-2', 'colsep': '0', 'rowsep': '0' }]
					]
				]
			];

			const options = {
				table: {
					localName: 'table'
				}
			};

			transformTable(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 3x3 table, merging a cell with a cell to the left', () => {
			const jsonIn = ['tgroup',
				{ 'cols': '3' },
				['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '0', 'rowsep': '0' }],
				['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '1*', 'colsep': '0', 'rowsep': '0' }],
				['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '1*', 'colsep': '0', 'rowsep': '0' }],
				['tbody',
					['row',
						['entry', { 'colname': 'column-0', 'colsep': '0', 'rowsep': '0' }],
						['entry', { 'colname': 'column-1', 'colsep': '0', 'rowsep': '0' }],
						['entry', { 'colname': 'column-2', 'colsep': '0', 'rowsep': '0' }]
					],
					['row',
						['entry', { 'colname': 'column-0', 'colsep': '0', 'rowsep': '0' }],
						['entry', { 'colname': 'column-1', 'colsep': '0', 'rowsep': '0' }],
						['entry', { 'colname': 'column-2', 'colsep': '0', 'rowsep': '0' }]
					],
					['row',
						['entry', { 'colname': 'column-0', 'colsep': '0', 'rowsep': '0' }],
						['entry', { 'colname': 'column-1', 'colsep': '0', 'rowsep': '0' }],
						['entry', { 'colname': 'column-2', 'colsep': '0', 'rowsep': '0' }]
					]
				]
			];

			const mutateGridModel = (gridModel) =>
				mergeCellWithCellToTheLeft(gridModel, gridModel.getCellAtCoordinates(1, 1), blueprint);

			const jsonOut = ['tgroup',
				{ 'cols': '3' },
				['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '0', 'rowsep': '0' }],
				['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '1*', 'colsep': '0', 'rowsep': '0' }],
				['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '1*', 'colsep': '0', 'rowsep': '0' }],
				['tbody',
					['row',
						['entry', { 'colname': 'column-0', 'colsep': '0', 'rowsep': '0' }],
						['entry', { 'colname': 'column-1', 'colsep': '0', 'rowsep': '0' }],
						['entry', { 'colname': 'column-2', 'colsep': '0', 'rowsep': '0' }]
					],
					['row',
						['entry', { 'colsep': '0', 'rowsep': '0', 'namest': 'column-0', 'nameend': 'column-1' }],
						['entry', { 'colname': 'column-2', 'colsep': '0', 'rowsep': '0' }]
					],
					['row',
						['entry', { 'colname': 'column-0', 'colsep': '0', 'rowsep': '0' }],
						['entry', { 'colname': 'column-1', 'colsep': '0', 'rowsep': '0' }],
						['entry', { 'colname': 'column-2', 'colsep': '0', 'rowsep': '0' }]
					]
				]
			];

			const options = {
				table: {
					localName: 'table'
				}
			};

			transformTable(jsonIn, jsonOut, options, mutateGridModel);
		});
	});

	describe('Splitting cells', () => {
		it('can handle a 3x3 table, splitting a cell spanning over rows', () => {
			const jsonIn = ['tgroup',
				{ 'cols': '3' },
				['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '0', 'rowsep': '0' }],
				['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '1*', 'colsep': '0', 'rowsep': '0' }],
				['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '1*', 'colsep': '0', 'rowsep': '0' }],
				['tbody',
					['row',
						['entry', { 'colname': 'column-0', 'colsep': '0', 'rowsep': '0' }],
						['entry', { 'colname': 'column-1', 'colsep': '0', 'rowsep': '0' }],
						['entry', { 'colname': 'column-2', 'colsep': '0', 'rowsep': '0' }]
					],
					['row',
						['entry', { 'colname': 'column-0', 'colsep': '0', 'rowsep': '0' }],
						['entry', { 'colname': 'column-1', 'colsep': '0', 'rowsep': '0', 'morerows': '1' }],
						['entry', { 'colname': 'column-2', 'colsep': '0', 'rowsep': '0' }]
					],
					['row',
						['entry', { 'colname': 'column-0', 'colsep': '0', 'rowsep': '0' }],
						['entry', { 'colname': 'column-2', 'colsep': '0', 'rowsep': '0' }]
					]
				]
			];

			const mutateGridModel = (gridModel) =>
				splitCellIntoRows(gridModel, gridModel.getCellAtCoordinates(1, 1));

			const jsonOut = ['tgroup',
				{ 'cols': '3' },
				['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '0', 'rowsep': '0' }],
				['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '1*', 'colsep': '0', 'rowsep': '0' }],
				['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '1*', 'colsep': '0', 'rowsep': '0' }],
				['tbody',
					['row',
						['entry', { 'colname': 'column-0', 'colsep': '0', 'rowsep': '0' }],
						['entry', { 'colname': 'column-1', 'colsep': '0', 'rowsep': '0' }],
						['entry', { 'colname': 'column-2', 'colsep': '0', 'rowsep': '0' }]
					],
					['row',
						['entry', { 'colname': 'column-0', 'colsep': '0', 'rowsep': '0' }],
						['entry', { 'colname': 'column-1', 'colsep': '0', 'rowsep': '0' }],
						['entry', { 'colname': 'column-2', 'colsep': '0', 'rowsep': '0' }]
					],
					['row',
						['entry', { 'colname': 'column-0', 'colsep': '0', 'rowsep': '0' }],
						['entry', { 'colname': 'column-1', 'colsep': '0', 'rowsep': '0' }],
						['entry', { 'colname': 'column-2', 'colsep': '0', 'rowsep': '0' }]
					]
				]
			];

			const options = {
				table: {
					localName: 'table'
				}
			};

			transformTable(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 3x3 table, splitting a cell spanning over columns', () => {
			const jsonIn = ['tgroup',
				{ 'cols': '3' },
				['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '0', 'rowsep': '0' }],
				['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '1*', 'colsep': '0', 'rowsep': '0' }],
				['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '1*', 'colsep': '0', 'rowsep': '0' }],
				['tbody',
					['row',
						['entry', { 'colname': 'column-0', 'colsep': '0', 'rowsep': '0' }],
						['entry', { 'colname': 'column-1', 'colsep': '0', 'rowsep': '0' }],
						['entry', { 'colname': 'column-2', 'colsep': '0', 'rowsep': '0' }]
					],
					['row',
						['entry', { 'colname': 'column-0', 'colsep': '0', 'rowsep': '0' }],
						['entry', { 'namest': 'column-1', 'nameend': 'column-2', 'colsep': '0', 'rowsep': '0' }]
					],
					['row',
						['entry', { 'colname': 'column-0', 'colsep': '0', 'rowsep': '0' }],
						['entry', { 'colname': 'column-1', 'colsep': '0', 'rowsep': '0' }],
						['entry', { 'colname': 'column-2', 'colsep': '0', 'rowsep': '0' }]
					]
				]
			];

			const mutateGridModel = (gridModel) =>
				splitCellIntoColumns(gridModel, gridModel.getCellAtCoordinates(1, 1));

				const jsonOut = ['tgroup',
					{ 'cols': '3' },
					['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '0', 'rowsep': '0' }],
					['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '1*', 'colsep': '0', 'rowsep': '0' }],
					['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '1*', 'colsep': '0', 'rowsep': '0' }],
					['tbody',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '0', 'rowsep': '0' }],
							['entry', { 'colname': 'column-1', 'colsep': '0', 'rowsep': '0' }],
							['entry', { 'colname': 'column-2', 'colsep': '0', 'rowsep': '0' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '0', 'rowsep': '0' }],
							['entry', { 'colname': 'column-1', 'colsep': '0', 'rowsep': '0' }],
							['entry', { 'colname': 'column-2', 'colsep': '0', 'rowsep': '0' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '0', 'rowsep': '0' }],
							['entry', { 'colname': 'column-1', 'colsep': '0', 'rowsep': '0' }],
							['entry', { 'colname': 'column-2', 'colsep': '0', 'rowsep': '0' }]
						]
					]
				];


			const options = {
				table: {
					localName: 'table'
				}
			};

			transformTable(jsonIn, jsonOut, options, mutateGridModel);
		});
	});

	describe('Tables not having all the colspecs', () => {
		it('can transform a table having no colspec at all', () => {
			const jsonIn = ['tgroup',
					{ 'cols': '3' },
					['tbody',
						['row', ['entry'], ['entry'], ['entry']],
						['row', ['entry'], ['entry'], ['entry']],
						['row', ['entry'], ['entry'], ['entry']]
					]
				];

			const jsonOut = ['tgroup',
					{ 'cols': '3' },
					['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['tbody',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }]
						]
					]
				];

			const options = {
					table: {
						localName: 'table'
					}
				};

			transformTable(jsonIn, jsonOut, options);
		});

		it('can transform a table having only 1 colspec', () => {
			const jsonIn = ['tgroup',
					{ 'cols': '3' },
					['colspec', { 'colname': 'some-non-standard-colname', 'colsep': '0', 'rowsep': '0' }],
					['tbody',
						['row', ['entry', { colname: 'column-0' }], ['entry'], ['entry']],
						['row', ['entry'], ['entry'], ['entry']],
						['row', ['entry'], ['entry'], ['entry']]
					]
				];

			const jsonOut = ['tgroup', { 'cols': '3' },
					['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '0', 'rowsep': '0' }],
					['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
					['tbody',
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '0', 'rowsep': '0' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }]
						],
						['row',
							['entry', { 'colname': 'column-0', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-1', 'colsep': '1', 'rowsep': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '1', 'rowsep': '1' }]
						]
					]
				];

			const options = {
					table: {
						localName: 'table'
					}
				};

			transformTable(jsonIn, jsonOut, options);
		});
	});

	describe('CALS specifics', () => {
		it('can handle a 3x3 table, merging a cell with the cell below', () => {
			const jsonIn = ['tgroup',
				{ 'cols': '3' },
				['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '0', 'rowsep': '0' }],
				['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '1*', 'colsep': '0', 'rowsep': '0' }],
				['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '1*', 'colsep': '0', 'rowsep': '0' }],
				['tbody',
					['row',
						['entry', { 'colname': 'column-0', 'colsep': '0', 'rowsep': '0' }],
						['entry', { 'colname': 'column-1', 'colsep': '0', 'rowsep': '0' }],
						['entry', { 'colname': 'column-2', 'colsep': '0', 'rowsep': '0' }]
					],
					['row',
						['entry', { 'colname': 'column-0', 'colsep': '0', 'rowsep': '0' }],
						['entry', { 'colname': 'column-1', 'colsep': '0', 'rowsep': '0' }],
						['entry', { 'colname': 'column-2', 'colsep': '0', 'rowsep': '0' }]
					],
					['row',
						['entry', { 'colname': 'column-0', 'colsep': '0', 'rowsep': '0' }],
						['entry', { 'colname': 'column-1', 'colsep': '0', 'rowsep': '0' }],
						['entry', { 'colname': 'column-2', 'colsep': '0', 'rowsep': '0' }]
					]
				]
			];

			const mutateGridModel = (gridModel) => {
					mergeCellWithCellBelow(gridModel, gridModel.getCellAtCoordinates(1, 0), blueprint);
					mergeCellWithCellBelow(gridModel, gridModel.getCellAtCoordinates(1, 1), blueprint);
					mergeCellWithCellBelow(gridModel, gridModel.getCellAtCoordinates(1, 2), blueprint);
				};

			const jsonOut = ['tgroup',
				{ 'cols': '3' },
				['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '0', 'rowsep': '0' }],
				['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '1*', 'colsep': '0', 'rowsep': '0' }],
				['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '1*', 'colsep': '0', 'rowsep': '0' }],
				['tbody',
					['row',
						['entry', { 'colname': 'column-0', 'colsep': '0', 'rowsep': '0' }],
						['entry', { 'colname': 'column-1', 'colsep': '0', 'rowsep': '0' }],
						['entry', { 'colname': 'column-2', 'colsep': '0', 'rowsep': '0' }]
					],
					['row',
						['entry', { 'colname': 'column-0', 'colsep': '0', 'rowsep': '0' }],
						['entry', { 'colname': 'column-1', 'colsep': '0', 'rowsep': '0' }],
						['entry', { 'colname': 'column-2', 'colsep': '0', 'rowsep': '0' }]
					]
				]
			];

			const options = {
				table: {
					localName: 'table'
				}
			};

			transformTable(jsonIn, jsonOut, options, mutateGridModel);
		});
	});
});
