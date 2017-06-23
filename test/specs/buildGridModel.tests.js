import blueprints from 'fontoxml-blueprints';
import core from 'fontoxml-core';
import getNodeId from 'fontoxml-dom-identification/getNodeId';
import jsonMLMapper from 'fontoxml-dom-utils/jsonMLMapper';
import TableStructureManager from 'fontoxml-table-flow/TableStructureManager';
import * as slimdom from 'slimdom';

import buildGridModel from 'fontoxml-table-flow-cals/tableStructure/buildGridModel';
import CalsTableStructure from 'fontoxml-table-flow-cals/tableStructure/CalsTableStructure';

const Blueprint = blueprints.Blueprint;
const CoreDocument = core.Document;

describe('buildGridModel()', () => {
	let documentNode,
		coreDocument,
		blueprint,
		calsTableStructure;

	beforeEach(() => {
		documentNode = new slimdom.Document();
		coreDocument = new CoreDocument(documentNode);

		blueprint = new Blueprint(coreDocument.dom);
		calsTableStructure = new CalsTableStructure({
			table: {
				localName: 'table',
				namespaceUri: ''
			},
			tgroup: {
				namespaceUri: ''
			}
		});
		TableStructureManager.addTableStructure(calsTableStructure);
	});

	it('can build a gridModel from a basic table', () => {
		coreDocument.dom.mutate(() => jsonMLMapper.parse(
			['table',
				['tgroup',
					{ cols: 3 },
					['colspec'],
					['colspec'],
					['colspec'],
					['thead',
						['row',
							['entry'],
							['entry'],
							['entry']
						]
					],
					['tbody',
						['row',
							['entry'],
							['entry'],
							['entry']
						],
						['row',
							['entry'],
							['entry'],
							['entry']
						],
						['row',
							['entry'],
							['entry'],
							['entry']
						]
					]
				]
			], documentNode));

		const tableElement = documentNode.firstChild;
		const tgroupElement = tableElement.firstChild;

		const gridModel = buildGridModel(calsTableStructure, tgroupElement, blueprint);
		chai.assert.isOk(gridModel);

		chai.assert.equal(gridModel.getHeight(), 4, 'height');
		chai.assert.equal(gridModel.getWidth(), 3, 'width');
	});

	it('can build a gridModel from a table with colnum starting a 0', () => {
		coreDocument.dom.mutate(() => jsonMLMapper.parse(
			['table',
				['tgroup',
					{ cols: 3 },
					['colspec', { colnum: 0 }],
					['colspec', { colnum: 1 }],
					['colspec', { colnum: 2 }],
					['thead',
						['row',
							['entry'],
							['entry'],
							['entry']
						]
					],
					['tbody',
						['row',
							['entry'],
							['entry'],
							['entry']
						],
						['row',
							['entry'],
							['entry'],
							['entry']
						],
						['row',
							['entry'],
							['entry'],
							['entry']
						]
					]
				]
			], documentNode));

		const tableElement = documentNode.firstChild;
		const tgroupElement = tableElement.firstChild;

		const gridModel = buildGridModel(calsTableStructure, tgroupElement, blueprint);
		chai.assert.isOk(gridModel);

		chai.assert.equal(gridModel.getHeight(), 4, 'height');
		chai.assert.equal(gridModel.getWidth(), 3, 'width');
	});

	it('can build a gridModel from a table containing comments and processing instructions', () => {
		coreDocument.dom.mutate(() => jsonMLMapper.parse(
			['table',
				['tgroup',
					{ cols: 3 },
					['colspec'],
					['colspec'],
					['colspec'],
					['thead',
						['row',
							['entry'],
							['?someProcessingInstruction', 'someContent'],
							['entry'],
							['entry']
						]
					],
					['tbody',
						['row',
							['entry'],
							['entry'],
							['!', 'some comment'],
							['entry']
						],
						['row',
							['entry'],
							['entry'],
							['entry']
						],
						['row',
							['entry'],
							['entry'],
							['entry']
						]
					]
				]
			], documentNode));

		const tableElement = documentNode.firstChild;
		const tgroupElement = tableElement.firstChild;

		const gridModel = buildGridModel(calsTableStructure, tgroupElement, blueprint);
		chai.assert.isOk(gridModel);

		chai.assert.equal(gridModel.getHeight(), 4, 'height');
		chai.assert.equal(gridModel.getWidth(), 3, 'width');
	});

	describe('colSpans', () => {
		it('can build a gridModel from a table containing colspans on the first row', () => {
			coreDocument.dom.mutate(() => jsonMLMapper.parse(
				['table',
					['tgroup',
						{ cols: 3 },
						['colspec', { colname: 'column-0', colnum: '1', colwidth: '1*', colsep: '1', rowsep: '1' }],
						['colspec', { colname: 'column-1', colnum: '2', colwidth: '1*', colsep: '1', rowsep: '1' }],
						['colspec', { colname: 'column-2', colnum: '3', colwidth: '1*', colsep: '1', rowsep: '1' }],
						['tbody',
							['row',
								['entry', { namest: 'column-0', colname: 'column-0', nameend: 'column-1' }],
								['entry', { namest: 'column-2', colname: 'column-2', nameend: 'column-2' }]
							],
							['row',
								['entry'],
								['entry'],
								['entry']
							],
							['row',
								['entry'],
								['entry'],
								['entry']
							]
						]
					]
				], documentNode));

			const tableElement = documentNode.firstChild;
			const tgroupElement = tableElement.firstChild;

			const gridModel = buildGridModel(calsTableStructure, tgroupElement, blueprint);
			chai.assert.isOk(gridModel);

			chai.assert.equal(gridModel.getHeight(), 3, 'height');
			chai.assert.equal(gridModel.getWidth(), 3, 'width');

			const firstSpanningCell = gridModel.getCellAtCoordinates(0, 0);
			const secondSpanningCell = gridModel.getCellAtCoordinates(0, 1);
			chai.assert.deepEqual(firstSpanningCell.element, secondSpanningCell.element);
		});

		it('can build a gridModel from a table containing colspans', () => {
			coreDocument.dom.mutate(() => jsonMLMapper.parse(
				['table',
					['tgroup',
						{ cols: 3 },
						['colspec', { colname: 'c1' }],
						['colspec', { colname: 'c2' }],
						['colspec', { colname: 'c3' }],
						['thead',
							['row',
								['entry'],
								['entry'],
								['entry']
							]
						],
						['tbody',
							['row',
								['entry', { namest: 'c1', nameend: 'c2' }],
								['entry']
							],
							['row',
								['entry'],
								['entry'],
								['entry']
							],
							['row',
								['entry'],
								['entry'],
								['entry']
							]
						]
					]
				], documentNode));

			const tableElement = documentNode.firstChild;
			const tgroupElement = tableElement.firstChild;

			const gridModel = buildGridModel(calsTableStructure, tgroupElement, blueprint);
			chai.assert.isOk(gridModel);

			chai.assert.equal(gridModel.getHeight(), 4, 'height');
			chai.assert.equal(gridModel.getWidth(), 3, 'width');

			const firstSpanningCell = gridModel.getCellAtCoordinates(1, 0);
			const secondSpanningCell = gridModel.getCellAtCoordinates(1, 1);
			chai.assert.equal(getNodeId(firstSpanningCell.element), getNodeId(secondSpanningCell.element));
		});

		it('can build a gridModel from a cals table containing colspans but not all colspecs', () => {
			coreDocument.dom.mutate(() => jsonMLMapper.parse(
				['table',
					['tgroup',
						{ cols: 3 },
						['colspec', { colname: 'c1' }],
						['colspec', { colname: 'c3' }],
						['thead',
							['row',
								['entry'],
								['entry'],
								['entry']
							]
						],
						['tbody',
							['row',
								['entry', { namest: 'c1', nameend: 'c3' }],
								['entry']
							],
							['row',
								['entry'],
								['entry'],
								['entry']
							],
							['row',
								['entry'],
								['entry'],
								['entry']
							]
						]
					]
				], documentNode));

			const tableElement = documentNode.firstChild;
			const tgroupElement = tableElement.firstChild;

			const gridModel = buildGridModel(calsTableStructure, tgroupElement, blueprint);
			chai.assert.isOk(gridModel);

			chai.assert.equal(gridModel.getHeight(), 4, 'height');
			chai.assert.equal(gridModel.getWidth(), 3, 'width');

			const firstSpanningCell = gridModel.getCellAtCoordinates(1, 0);
			const secondSpanningCell = gridModel.getCellAtCoordinates(1, 1);
			chai.assert.deepEqual(firstSpanningCell.element, secondSpanningCell.element);
		});

		it('throws when building a gridModel from a cals table containing incorrect colspans', () => {
			coreDocument.dom.mutate(() => jsonMLMapper.parse(
				['table',
					['tgroup',
						{ cols: 3 },
						['colspec', { colname: 'c1' }],
						['colspec', { colname: 'c2' }],
						['colspec', { colname: 'c3' }],
						['thead',
							['row',
								['entry'],
								['entry'],
								['entry']
							]
						],
						['tbody',
							['row',
								['entry', { namest: 'c1', nameend: 'c3' }],
								['entry']
							],
							['row',
								['entry'],
								['entry'],
								['entry']
							],
							['row',
								['entry'],
								['entry'],
								['entry']
							]
						]
					]
				], documentNode));

			const tableElement = documentNode.firstChild;
			const tgroupElement = tableElement.firstChild;
			chai.assert.throws(buildGridModel.bind(undefined, calsTableStructure, tgroupElement, blueprint));
		});
	});

	describe('rowSpans', () => {
		it('can build a gridModel from a table containing rowspans', () => {
			coreDocument.dom.mutate(() => jsonMLMapper.parse(
				['table',
					['tgroup',
						{ cols: 3 },
						['colspec', { colname: 'c1' }],
						['colspec', { colname: 'c2' }],
						['colspec', { colname: 'c3' }],
						['thead',
							['row',
								['entry'],
								['entry'],
								['entry']
							]
						],
						['tbody',
							['row',
								['entry', { morerows: '1' }],
								['entry'],
								['entry']
							],
							['row',
								['entry'],
								['entry']
							],
							['row',
								['entry'],
								['entry'],
								['entry']
							]
						]
					]
				], documentNode));

			const tableElement = documentNode.firstChild;
			const tgroupElement = tableElement.firstChild;

			const gridModel = buildGridModel(calsTableStructure, tgroupElement, blueprint);
			chai.assert.isOk(gridModel);

			chai.assert.equal(gridModel.getHeight(), 4, 'height');
			chai.assert.equal(gridModel.getWidth(), 3, 'width');

			const firstSpanningCell = gridModel.getCellAtCoordinates(1, 0);
			const secondSpanningCell = gridModel.getCellAtCoordinates(2, 0);
			chai.assert.equal(getNodeId(firstSpanningCell.element), getNodeId(secondSpanningCell.element));
		});

		it('can build a gridModel from a table containing rowspans that overlap entire rows', () => {
			coreDocument.dom.mutate(() => jsonMLMapper.parse(
				['table',
					['tgroup',
						{ cols: 3 },
						['colspec', { colname: 'c1' }],
						['colspec', { colname: 'c2' }],
						['colspec', { colname: 'c3' }],
						['thead',
							['row',
								['entry'],
								['entry'],
								['entry']
							]
						],
						['tbody',
							['row',
								['entry', { morerows: '1' }],
								['entry', { morerows: '1' }],
								['entry', { morerows: '1' }]
							],
							['row',
								['entry'],
								['entry'],
								['entry']
							],
							['row',
								['entry'],
								['entry'],
								['entry']
							]
						]
					]
				], documentNode));

			const tableElement = documentNode.firstChild;
			const tgroupElement = tableElement.firstChild;

			const gridModel = buildGridModel(calsTableStructure, tgroupElement, blueprint);
			chai.assert.isOk(gridModel);

			chai.assert.equal(gridModel.getHeight(), 4, 'height');
			chai.assert.equal(gridModel.getWidth(), 3, 'width');
		});

		it('throws when building a gridModel from a cals table containing incorrect rowspans', () => {
			coreDocument.dom.mutate(() => jsonMLMapper.parse(
				['table',
					['tgroup',
						{ cols: 3 },
						['colspec', { colname: 'c1' }],
						['colspec', { colname: 'c2' }],
						['colspec', { colname: 'c3' }],
						['thead',
							['row',
								['entry'],
								['entry'],
								['entry']
							]
						],
						['tbody',
							['row',
								['entry', { morerows: 3 }],
								['entry']
							],
							['row',
								['entry'],
								['entry']
							],
							['row',
								['entry'],
								['entry']
							]
						]
					]
				], documentNode));

			const tableElement = documentNode.firstChild;
			const tgroupElement = tableElement.firstChild;
			chai.assert.throws(buildGridModel.bind(undefined, calsTableStructure, tgroupElement, blueprint));
		});

		it('can build a gridModel from a cals table containing rowspans on all cells but the middle', () => {
			coreDocument.dom.mutate(() => jsonMLMapper.parse(
				['table',
					['tgroup',
						{ cols: 3 },
						['colspec', { colname: 'c1' }],
						['colspec', { colname: 'c2' }],
						['colspec', { colname: 'c3' }],
						['thead',
							['row',
								['entry'],
								['entry'],
								['entry']
							]
						],
						['tbody',
							['row',
								['entry', { namest: 'c1', nameend: 'c2' }],
								['entry']
							],
							['row',
								['entry'],
								['entry'],
								['entry']
							],
							['row',
								['entry'],
								['entry'],
								['entry']
							]
						]
					]
				], documentNode));

			const tableElement = documentNode.firstChild;
			const tgroupElement = tableElement.firstChild;

			const gridModel = buildGridModel(calsTableStructure, tgroupElement, blueprint);
			chai.assert.isOk(gridModel);

			chai.assert.equal(gridModel.getHeight(), 4, 'height');
			chai.assert.equal(gridModel.getWidth(), 3, 'width');

			const firstCell = gridModel.getCellAtCoordinates(1, 2);
			chai.assert.isTrue(!!firstCell);
			chai.assert.equal(firstCell.origin.row, 1, 'row');
			chai.assert.equal(firstCell.origin.column, 2, 'column');
		});
	});

	describe('rowSpans combined with colSpans', () => {
		it('can build a gridModel from a cals table containing rowspans and colspans in the same cell', () => {
			coreDocument.dom.mutate(() => jsonMLMapper.parse(
				['table',
					['tgroup',
						{ cols: 3 },
						['colspec', { colname: 'c1' }],
						['colspec', { colname: 'c2' }],
						['colspec', { colname: 'c3' }],
						['thead',
							['row',
								['entry'],
								['entry'],
								['entry']
							]
						],
						['tbody',
							['row',
								['entry', { morerows: '1', namest: 'c1', nameend: 'c2' }],
								// One cell spans from the previous cell
								['entry']
							],
							['row',
								// Two cells span from the previous row
								['entry']
							],
							['row',
								['entry'],
								['entry'],
								['entry']
							]
						]
					]
				], documentNode));

			const tableElement = documentNode.firstChild;
			const tgroupElement = tableElement.firstChild;

			const gridModel = buildGridModel(calsTableStructure, tgroupElement, blueprint);
			chai.assert.isOk(gridModel);

			chai.assert.equal(gridModel.getHeight(), 4, 'height');
			chai.assert.equal(gridModel.getWidth(), 3, 'width');

			const firstSpanningCell = gridModel.getCellAtCoordinates(1, 0);
			const secondSpanningCell = gridModel.getCellAtCoordinates(2, 0);
			const thirdSpanningCell = gridModel.getCellAtCoordinates(1, 1);
			const fourthSpanningCell = gridModel.getCellAtCoordinates(2, 1);
			chai.assert.isOk(firstSpanningCell);
			chai.assert.equal(getNodeId(firstSpanningCell.element), getNodeId(secondSpanningCell.element));
			chai.assert.equal(getNodeId(secondSpanningCell.element), getNodeId(thirdSpanningCell.element));
			chai.assert.equal(getNodeId(thirdSpanningCell.element), getNodeId(fourthSpanningCell.element));
		});

		it('can build a table containing row and colspans on the first row (header)', () => {
			coreDocument.dom.mutate(() => jsonMLMapper.parse(
				['table',
					['tgroup',
						{ cols: '5', colsep: '1', rowsep: '1' },
						['colspec', { colname: 'c1', colwidth: '2*' }],
						['colspec', { colname: 'c2', colwidth: '2*' }],
						['colspec', { colname: 'c3', colwidth: '2*' }],
						['colspec', { colnum: '6', colname: 'c5', colwidth: '2*' }],
						['thead',
							['row',
								['entry', { namest: 'c1', nameend: 'c2', align: 'center' }, 'Horizontal span'],
								['entry', 'a3'],
								['entry', 'a4'],
								['entry', 'a5']
							]
						],
						['tbody',
							['row',
								['entry', 'b1'],
								['entry', 'b2'],
								['entry', 'b3'],
								['entry', 'b4'],
								['entry', { morerows: '1', valign: 'middle' }, 'Vertical span']
							],
							['row',
								['entry'],
								['entry', { namest: 'c2', nameend: 'c3', align: 'center', morerows: '1', valign: 'bottom' }],
								['entry']
							],
							['row',
								['entry', 'd1'],
								['entry', 'd4'],
								['entry', 'd5']
							]
						]
					]
				], documentNode));

			const tgroupElement = documentNode.firstChild.firstChild;
			const tableGridModel = buildGridModel(calsTableStructure, tgroupElement, blueprint);
			chai.assert.isTrue(!!tableGridModel);
		});

		it('throws when building a gridModel from a table containing incorrect rowspans and colspans', () => {
			coreDocument.dom.mutate(() => jsonMLMapper.parse(
				['table',
					['tgroup',
						{ cols: 3 },
						['colspec', { colname: 'c1' }],
						['colspec', { colname: 'c2' }],
						['colspec', { colname: 'c3' }],
						['thead',
							['row',
								['entry'],
								['entry'],
								['entry']
							]
						],
						['tbody',
							['row',
								['entry', { morerows: 3, namest: 'c1', nameend: 'c3' }],
								['entry']
							],
							['row',
								['entry'],
								['entry']
							],
							['row',
								['entry'],
								['entry']
							]
						]
					]
				], documentNode));

			const tableElement = documentNode.firstChild;
			const tgroupElement = tableElement.firstChild;
			chai.assert.throws(buildGridModel.bind(undefined, calsTableStructure, tgroupElement, blueprint));
		});
	});

	describe('units of width', () => {
		it('can create a table with proportional widths', () => {
			coreDocument.dom.mutate(() => jsonMLMapper.parse(
				['table',
					['tgroup',
						{ cols: 3 },
						['colspec', { colwidth: '1*' }],
						['colspec', { colwidth: '1*' }],
						['colspec', { colwidth: '2*' }],
						['thead',
							['row',
								['entry'],
								['entry'],
								['entry']
							]
						],
						['tbody',
							['row',
								['entry'],
								['entry'],
								['entry']
							],
							['row',
								['entry'],
								['entry'],
								['entry']
							],
							['row',
								['entry'],
								['entry'],
								['entry']
							]
						]
					]
				], documentNode));

			const tableElement = documentNode.firstChild;
			const tgroupElement = tableElement.firstChild;

			const gridModel = buildGridModel(calsTableStructure, tgroupElement, blueprint);
			chai.assert.isOk(gridModel);

			chai.assert.equal(gridModel.getHeight(), 4, 'height');
			chai.assert.equal(gridModel.getWidth(), 3, 'width');

			const leftColumn = gridModel.getCellByNodeId(getNodeId(tgroupElement.lastChild.lastChild.firstChild));
			const rightColumn = gridModel.getCellByNodeId(getNodeId(tgroupElement.lastChild.lastChild.lastChild));
			chai.assert.equal(leftColumn.data.width, '25*');
			chai.assert.equal(rightColumn.data.width, '50*');
		});

		it('can create a table with fixed widths', () => {
			coreDocument.dom.mutate(() => jsonMLMapper.parse(
				['table',
					['tgroup',
						{ cols: 3 },
						['colspec', { colwidth: '10pt' }],
						['colspec', { colwidth: '10pt' }],
						['colspec', { colwidth: '20pt' }],
						['thead',
							['row',
								['entry'],
								['entry'],
								['entry']
							]
						],
						['tbody',
							['row',
								['entry'],
								['entry'],
								['entry']
							],
							['row',
								['entry'],
								['entry'],
								['entry']
							],
							['row',
								['entry'],
								['entry'],
								['entry']
							]
						]
					]
				], documentNode));

			const tableElement = documentNode.firstChild;
			const tgroupElement = tableElement.firstChild;

			const gridModel = buildGridModel(calsTableStructure, tgroupElement, blueprint);
			chai.assert.isOk(gridModel);

			chai.assert.equal(gridModel.getHeight(), 4, 'height');
			chai.assert.equal(gridModel.getWidth(), 3, 'width');

			const leftColumn = gridModel.getCellByNodeId(getNodeId(tgroupElement.lastChild.lastChild.firstChild));
			const rightColumn = gridModel.getCellByNodeId(getNodeId(tgroupElement.lastChild.lastChild.lastChild));

			chai.assert.equal(leftColumn.data.width, '10pt');
			chai.assert.equal(rightColumn.data.width, '20pt');
		});
	});
});
