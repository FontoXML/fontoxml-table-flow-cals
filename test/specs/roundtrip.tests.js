import blueprints from 'fontoxml-blueprints';
import core from 'fontoxml-core';
import jsonMLMapper from 'fontoxml-dom-utils/jsonMLMapper';
import * as slimdom from 'slimdom';

import CalsTableStructure from 'fontoxml-table-flow-cals/tableStructure/CalsTableStructure';

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
		}
	};

describe('CALS tables: XML to XML', () => {
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

		const tableStructure = new CalsTableStructure(options);
		const tableNode = documentNode.firstChild;
		const gridModel = tableStructure.buildGridModel(tableNode, blueprint);
		chai.assert.isOk(gridModel);

		mutateGridModel(gridModel);

		const success = tableStructure.applyToDom(gridModel, tableNode, blueprint, stubFormat);
		chai.assert.isTrue(success);

		blueprint.realize();
		chai.assert.deepEqual(jsonMLMapper.serialize(documentNode.firstChild), jsonOut);
	}

	describe('tables not having all the colspecs', () => {
		it('can transform a table having no colspec at all', () => {
			const jsonIn = ['tgroup', { 'cols': '3' },
				['tbody',
					['row', ['entry'], ['entry'], ['entry']],
					['row', ['entry'], ['entry'], ['entry']],
					['row', ['entry'], ['entry'], ['entry']]
				]
			];

			const jsonOut = ['tgroup', { 'cols': '3' },
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
						localname: 'table'
					}
				};

			transformTable(jsonIn, jsonOut, options);
		});

		it('can transform a table having only 1 colspec', () => {
			const jsonIn = ['tgroup', { 'cols': '3' },
				['colspec', { 'colname': 'some-non-standard-colname', 'colsep': '0', 'rowsep': '0' }],
				['tbody',
					['row', ['entry', { colname: 'column-0' }], ['entry'], ['entry']],
					['row', ['entry'], ['entry'], ['entry']],
					['row', ['entry'], ['entry'], ['entry']]
				]
			];

			const jsonOut = ['tgroup', { 'cols': '3' },
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
						localname: 'table'
					}
				};

			transformTable(jsonIn, jsonOut, options);
		});
	});

	describe('merge cell', () => {
		it('can correctly merge two cells, center cell with cell above', () => {
			const jsonIn = ['tgroup', { 'cols': '3' },
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

			const jsonOut = ['tgroup', { 'cols': '3' },
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
					localname: 'table'
				}
			};

			transformTable(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can correctly merge two cells, center cell with cell to the right', () => {
			const jsonIn = ['tgroup', { 'cols': '3' },
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

			const jsonOut = ['tgroup', { 'cols': '3' },
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
					localname: 'table'
				}
			};

			transformTable(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can correctly merge two cells, center cell with cell below', () => {
			const jsonIn = ['tgroup', { 'cols': '3' },
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

			const jsonOut = ['tgroup', { 'cols': '3' },
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
					localname: 'table'
				}
			};

			transformTable(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can correctly merge two cells, center cell with cell to the left', () => {
			const jsonIn = ['tgroup', { 'cols': '3' },
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

			const jsonOut = ['tgroup', { 'cols': '3' },
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
					localname: 'table'
				}
			};

			transformTable(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can correctly merge a merged cell ((1,0) and (1,1)) with the cells above', () => {
			const jsonIn = ['tgroup', { 'cols': '3' },
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

			const mutateGridModel = (gridModel) =>
				mergeCellWithCellAbove(gridModel, gridModel.getCellAtCoordinates(1, 1), blueprint);

			const jsonOut = ['tgroup', { 'cols': '3' },
					['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '0', 'rowsep': '0' }],
					['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '1*', 'colsep': '0', 'rowsep': '0' }],
					['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '1*', 'colsep': '0', 'rowsep': '0' }],
					['tbody',
						['row',
							['entry', { 'colsep': '0', 'rowsep': '0', 'namest': 'column-0', 'nameend': 'column-1', 'morerows': '1' }],
							['entry', { 'colname': 'column-2', 'colsep': '0', 'rowsep': '0' }]
						],
						['row',
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
					localname: 'table'
				}
			};

			transformTable(jsonIn, jsonOut, options, mutateGridModel);
		});
	});
});

