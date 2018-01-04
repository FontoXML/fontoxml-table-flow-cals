import blueprints from 'fontoxml-blueprints';
import core from 'fontoxml-core';
import getNodeId from 'fontoxml-dom-identification/getNodeId';
import jsonMLMapper from 'fontoxml-dom-utils/jsonMLMapper';
import * as slimdom from 'slimdom';

import CalsTableDefinition from 'fontoxml-table-flow-cals/table-definition/CalsTableDefinition';

const Blueprint = blueprints.Blueprint;
const CoreDocument = core.Document;

describe('CALS tables: XML to GridModel', () => {
	let documentNode;
	let coreDocument;
	let blueprint;
	let tableDefinition;

	beforeEach(() => {
		documentNode = new slimdom.Document();
		coreDocument = new CoreDocument(documentNode);

		blueprint = new Blueprint(coreDocument.dom);
		tableDefinition = new CalsTableDefinition({
			table: {
				localName: 'table'
			}
		});
	});

	describe('Basics', () => {
		it('can deserialize a 1x1 table', () => {
			coreDocument.dom.mutate(() => jsonMLMapper.parse(
				['table',
					['tgroup',
						{ 'cols': '1' },
						['colspec'],
						['tbody',
							['row', ['entry']]
						]
					]
				], documentNode));

			const tgroupElement = documentNode.firstChild.firstChild;
			const gridModel = tableDefinition.buildTableGridModel(tgroupElement, blueprint);
			chai.assert.isOk(gridModel);

			chai.assert.equal(gridModel.getHeight(), 1);
			chai.assert.equal(gridModel.getWidth(), 1);
			chai.assert.equal(gridModel.headerRowCount, 0);
		});

		it('can deserialize a 4x4 table', () => {
			coreDocument.dom.mutate(() => jsonMLMapper.parse(
				['table',
					['tgroup',
						{ 'cols': '4' },
						['colspec'],
						['colspec'],
						['colspec'],
						['colspec'],
						['tbody',
							['row', ['entry'], ['entry'], ['entry'], ['entry']],
							['row', ['entry'], ['entry'], ['entry'], ['entry']],
							['row', ['entry'], ['entry'], ['entry'], ['entry']],
							['row', ['entry'], ['entry'], ['entry'], ['entry']]
						]
					]
				], documentNode));

			const tgroupElement = documentNode.firstChild.firstChild;
			const gridModel = tableDefinition.buildTableGridModel(tgroupElement, blueprint);
			chai.assert.isOk(gridModel);

			chai.assert.equal(gridModel.getHeight(), 4);
			chai.assert.equal(gridModel.getWidth(), 4);
			chai.assert.equal(gridModel.headerRowCount, 0);
		});

		it('can deserialize a 4x4 table starting with colnum 0', () => {
			coreDocument.dom.mutate(() => jsonMLMapper.parse(
				['table',
					['tgroup',
						{ 'cols': '4' },
						['colspec', { 'colnum': '0' }],
						['colspec', { 'colnum': '1' }],
						['colspec', { 'colnum': '2' }],
						['colspec', { 'colnum': '3' }],
						['tbody',
							['row', ['entry'], ['entry'], ['entry'], ['entry']],
							['row', ['entry'], ['entry'], ['entry'], ['entry']],
							['row', ['entry'], ['entry'], ['entry'], ['entry']],
							['row', ['entry'], ['entry'], ['entry'], ['entry']]
						]
					]
				], documentNode));

			const tgroupElement = documentNode.firstChild.firstChild;
			const gridModel = tableDefinition.buildTableGridModel(tgroupElement, blueprint);
			chai.assert.isOk(gridModel);

			chai.assert.equal(gridModel.getHeight(), 4);
			chai.assert.equal(gridModel.getWidth(), 4);
			chai.assert.equal(gridModel.headerRowCount, 0);
		});

		it('can deserialize a 4x4 table containing processing instructions and comments', () => {
			coreDocument.dom.mutate(() => jsonMLMapper.parse(
				['table',
					['tgroup',
						{ 'cols': '4' },
						['colspec'],
						['colspec'],
						['colspec'],
						['tbody',
							['row',
								['entry'],
								['?someProcessingInstruction', 'someContent'],
								['entry'],
								['entry'],
								['entry']
							],
							['row',
								['entry'],
								['entry'],
								['entry'],
								['!', 'some comment'],
								['entry']
							],
							['row', ['entry'], ['entry'], ['entry'], ['entry']],
							['row', ['entry'], ['entry'], ['entry'], ['entry']]
						]
					]
				], documentNode));

			const tgroupElement = documentNode.firstChild.firstChild;
			const gridModel = tableDefinition.buildTableGridModel(tgroupElement, blueprint);
			chai.assert.isOk(gridModel);

			chai.assert.equal(gridModel.getHeight(), 4);
			chai.assert.equal(gridModel.getWidth(), 4);
			chai.assert.equal(gridModel.headerRowCount, 0);
		});
	});

	describe('Headers and footers', () => {
		it('can deserialize a 4x4 table with 1 header row', () => {
			coreDocument.dom.mutate(() => jsonMLMapper.parse(
				['table',
					['tgroup',
						{ 'cols': '4' },
						['colspec', { 'colnum': '0' }],
						['colspec', { 'colnum': '1' }],
						['colspec', { 'colnum': '2' }],
						['colspec', { 'colnum': '3' }],
						['thead',
							['row', ['entry'], ['entry'], ['entry'], ['entry']]
						],
						['tbody',
							['row', ['entry'], ['entry'], ['entry'], ['entry']],
							['row', ['entry'], ['entry'], ['entry'], ['entry']],
							['row', ['entry'], ['entry'], ['entry'], ['entry']]
						]
					]
				], documentNode));

			const tgroupElement = documentNode.firstChild.firstChild;
			const gridModel = tableDefinition.buildTableGridModel(tgroupElement, blueprint);
			chai.assert.isOk(gridModel);

			chai.assert.equal(gridModel.getHeight(), 4);
			chai.assert.equal(gridModel.getWidth(), 4);
			chai.assert.equal(gridModel.headerRowCount, 1);
		});

		it('can deserialize a 4x4 table with 2 header rows', () => {
			coreDocument.dom.mutate(() => jsonMLMapper.parse(
				['table',
					['tgroup',
						{ 'cols': '4' },
						['colspec', { 'colnum': '0' }],
						['colspec', { 'colnum': '1' }],
						['colspec', { 'colnum': '2' }],
						['colspec', { 'colnum': '3' }],
						['thead',
							['row', ['entry'], ['entry'], ['entry'], ['entry']],
							['row', ['entry'], ['entry'], ['entry'], ['entry']]
						],
						['tbody',
							['row', ['entry'], ['entry'], ['entry'], ['entry']],
							['row', ['entry'], ['entry'], ['entry'], ['entry']]
						]
					]
				], documentNode));

			const tgroupElement = documentNode.firstChild.firstChild;
			const gridModel = tableDefinition.buildTableGridModel(tgroupElement, blueprint);
			chai.assert.isOk(gridModel);

			chai.assert.equal(gridModel.getHeight(), 4);
			chai.assert.equal(gridModel.getWidth(), 4);
			chai.assert.equal(gridModel.headerRowCount, 2);
		});

		it('can deserialize a 4x4 table with 1 header row and 1 footer row', () => {
			coreDocument.dom.mutate(() => jsonMLMapper.parse(
				['table',
					['tgroup',
						{ 'cols': '4' },
						['colspec', { 'colnum': '0' }],
						['colspec', { 'colnum': '1' }],
						['colspec', { 'colnum': '2' }],
						['colspec', { 'colnum': '3' }],
						['thead',
							['row', ['entry'], ['entry'], ['entry'], ['entry']]
						],
						['tbody',
							['row', ['entry'], ['entry'], ['entry'], ['entry']],
							['row', ['entry'], ['entry'], ['entry'], ['entry']]
						],
						['tfoot',
							['row', ['entry'], ['entry'], ['entry'], ['entry']]
						]
					]
				], documentNode));

			const tgroupElement = documentNode.firstChild.firstChild;
			const gridModel = tableDefinition.buildTableGridModel(tgroupElement, blueprint);
			chai.assert.isOk(gridModel);

			chai.assert.equal(gridModel.getHeight(), 4);
			chai.assert.equal(gridModel.getWidth(), 4);
			chai.assert.equal(gridModel.headerRowCount, 1);
		});
	});

	describe('Spanning cells', () => {
		describe('Column spanning cells', () => {
			it('can deserialize a 4x4 table with a column spanning cell on the first row', () => {
				coreDocument.dom.mutate(() => jsonMLMapper.parse(
					['table',
						['tgroup',
							{ 'cols': '4' },
							['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
							['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
							['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
							['colspec', { 'colname': 'column-3', 'colnum': '3', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
							['tbody',
								['row',
									['entry', { 'namest': 'column-0', 'colname': 'column-0', 'nameend': 'column-1' }],
									['entry', { 'namest': 'column-2', 'colname': 'column-2', 'nameend': 'column-2' }],
									['entry']
								],
								['row', ['entry'], ['entry'], ['entry'], ['entry']],
								['row', ['entry'], ['entry'], ['entry'], ['entry']],
								['row', ['entry'], ['entry'], ['entry'], ['entry']]
							]
						]
					], documentNode));

				const tableElement = documentNode.firstChild;
				const tgroupElement = tableElement.firstChild;

				const gridModel = tableDefinition.buildTableGridModel(tgroupElement, blueprint);
				chai.assert.isOk(gridModel);

				chai.assert.equal(gridModel.getHeight(), 4);
				chai.assert.equal(gridModel.getWidth(), 4);
				chai.assert.equal(gridModel.headerRowCount, 0);

				const firstSpanningCell = gridModel.getCellAtCoordinates(0, 0);
				const secondSpanningCell = gridModel.getCellAtCoordinates(0, 1);
				chai.assert.deepEqual(firstSpanningCell.element, secondSpanningCell.element);
			});

			it('can deserialize a 4x4 table with a column spanning cell on the first header row', () => {
				coreDocument.dom.mutate(() => jsonMLMapper.parse(
					['table',
						['tgroup',
							{ 'cols': '4' },
							['colspec', { 'colname': 'column-0', 'colnum': '1', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
							['colspec', { 'colname': 'column-1', 'colnum': '2', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
							['colspec', { 'colname': 'column-2', 'colnum': '3', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
							['colspec', { 'colname': 'column-3', 'colnum': '3', 'colwidth': '1*', 'colsep': '1', 'rowsep': '1' }],
							['thead',
								['row',
									['entry', { 'namest': 'column-0', 'colname': 'column-0', 'nameend': 'column-1' }],
									['entry', { 'namest': 'column-2', 'colname': 'column-2', 'nameend': 'column-2' }],
									['entry']
								],
							],
							['tbody',
								['row', ['entry'], ['entry'], ['entry'], ['entry']],
								['row', ['entry'], ['entry'], ['entry'], ['entry']],
								['row', ['entry'], ['entry'], ['entry'], ['entry']]
							]
						]
					], documentNode));

				const tableElement = documentNode.firstChild;
				const tgroupElement = tableElement.firstChild;

				const gridModel = tableDefinition.buildTableGridModel(tgroupElement, blueprint);
				chai.assert.isOk(gridModel);

				chai.assert.equal(gridModel.getHeight(), 4);
				chai.assert.equal(gridModel.getWidth(), 4);
				chai.assert.equal(gridModel.headerRowCount, 1);

				const firstSpanningCell = gridModel.getCellAtCoordinates(0, 0);
				const secondSpanningCell = gridModel.getCellAtCoordinates(0, 1);
				chai.assert.deepEqual(firstSpanningCell.element, secondSpanningCell.element);
			});

			it('can deserialize a 4x4 table with column spanning cells and missing colspecs', () => {
				coreDocument.dom.mutate(() => jsonMLMapper.parse(
					['table',
						['tgroup',
							{ 'cols': '4' },
							['colspec', { 'colname': 'c1' }],
							['colspec', { 'colname': 'c3' }],
							['tbody',
								['row', ['entry'], ['entry'], ['entry'], ['entry']],
								['row',
									['entry', { 'namest': 'c1', 'nameend': 'c3' }],
									['entry'],
									['entry']
								],
								['row', ['entry'], ['entry'], ['entry'], ['entry']],
								['row', ['entry'], ['entry'], ['entry'], ['entry']]
							]
						]
					], documentNode));

				const tableElement = documentNode.firstChild;
				const tgroupElement = tableElement.firstChild;

				const gridModel = tableDefinition.buildTableGridModel(tgroupElement, blueprint);
				chai.assert.isOk(gridModel);

				chai.assert.equal(gridModel.getHeight(), 4);
				chai.assert.equal(gridModel.getWidth(), 4);
				chai.assert.equal(gridModel.headerRowCount, 0);

				const firstSpanningCell = gridModel.getCellAtCoordinates(1, 0);
				const secondSpanningCell = gridModel.getCellAtCoordinates(1, 1);
				chai.assert.deepEqual(firstSpanningCell.element, secondSpanningCell.element);
			});

			it('throws when building a gridModel from a cals table containing incorrect colspans', () => {
				coreDocument.dom.mutate(() => jsonMLMapper.parse(
					['table',
						['tgroup',
							{ 'cols': '4' },
							['colspec', { 'colname': 'c1' }],
							['colspec', { 'colname': 'c2' }],
							['colspec', { 'colname': 'c3' }],
							['colspec', { 'colname': 'c4' }],
							['thead',
								['row', ['entry'], ['entry'], ['entry'], ['entry']]
							],
							['tbody',
								['row',
									['entry', { 'namest': 'c1', 'nameend': 'c4' }],
									['entry']
								],
								['row', ['entry'], ['entry'], ['entry'], ['entry']],
								['row', ['entry'], ['entry'], ['entry'], ['entry']]
							]
						]
					], documentNode));

				const tableElement = documentNode.firstChild;
				const tgroupElement = tableElement.firstChild;
				chai.assert.throws(tableDefinition.buildTableGridModel.bind(undefined, tgroupElement, blueprint));
			});
		});

		describe('Row spanning cells', () => {
			it('can deserialize a 4x4 table with a row spanning cell on the first row', () => {
				coreDocument.dom.mutate(() => jsonMLMapper.parse(
					['table',
						['tgroup',
							{ 'cols': '4' },
							['colspec', { 'colname': 'c1' }],
							['colspec', { 'colname': 'c2' }],
							['colspec', { 'colname': 'c3' }],
							['colspec', { 'colname': 'c4' }],
							['tbody',
								['row',
									['entry', { 'morerows': '1' }],
									['entry'],
									['entry'],
									['entry']
								],
								['row',
									['entry'],
									['entry'],
									['entry']
								],
								['row', ['entry'], ['entry'], ['entry'], ['entry']],
								['row', ['entry'], ['entry'], ['entry'], ['entry']]
							]
						]
					], documentNode));

				const tableElement = documentNode.firstChild;
				const tgroupElement = tableElement.firstChild;

				const gridModel = tableDefinition.buildTableGridModel(tgroupElement, blueprint);
				chai.assert.isOk(gridModel);

				chai.assert.equal(gridModel.getHeight(), 4);
				chai.assert.equal(gridModel.getWidth(), 4);
				chai.assert.equal(gridModel.headerRowCount, 0);

				const firstSpanningCell = gridModel.getCellAtCoordinates(0, 0);
				const secondSpanningCell = gridModel.getCellAtCoordinates(1, 0);
				chai.assert.equal(getNodeId(firstSpanningCell.element), getNodeId(secondSpanningCell.element));
			});

			it('can deserialize a 4x4 table with a row spanning cell spanning over a complete row', () => {
				coreDocument.dom.mutate(() => jsonMLMapper.parse(
					['table',
						['tgroup',
							{ cols: 4 },
							['colspec', { 'colname': 'c1' }],
							['colspec', { 'colname': 'c2' }],
							['colspec', { 'colname': 'c3' }],
							['colspec', { 'colname': 'c4' }],
							['tbody',
								['row',
									['entry', { 'morerows': '1' }],
									['entry', { 'morerows': '1' }],
									['entry', { 'morerows': '1' }],
									['entry', { 'morerows': '1' }]
								],
								['row',
									['entry'],
									['entry'],
									['entry'],
									['entry']
								],
								['row',
									['entry'],
									['entry'],
									['entry'],
									['entry']
								],
								['row',
									['entry'],
									['entry'],
									['entry'],
									['entry']
								]
							]
						]
					], documentNode));

				const tableElement = documentNode.firstChild;
				const tgroupElement = tableElement.firstChild;

				const gridModel = tableDefinition.buildTableGridModel(tgroupElement, blueprint);
				chai.assert.isOk(gridModel);

				chai.assert.equal(gridModel.getHeight(), 4);
				chai.assert.equal(gridModel.getWidth(), 4);
				chai.assert.equal(gridModel.headerRowCount, 0);
			});

			it('throws when building a gridModel from a cals table containing incorrect rowspans', () => {
				coreDocument.dom.mutate(() => jsonMLMapper.parse(
					['table',
						['tgroup',
							{ cols: 4 },
							['colspec', { 'colname': 'c1' }],
							['colspec', { 'colname': 'c2' }],
							['colspec', { 'colname': 'c3' }],
							['colspec', { 'colname': 'c4' }],
							['tbody',
								['row', ['entry'], ['entry'], ['entry'], ['entry']],
								['row',
									['entry', { 'morerows': 3 }],
									['entry'],
									['entry'],
									['entry']
								],
								['row', ['entry'], ['entry'], ['entry'], ['entry']],
								['row', ['entry'], ['entry'], ['entry'], ['entry']]
							]
						]
					], documentNode));

				const tableElement = documentNode.firstChild;
				const tgroupElement = tableElement.firstChild;
				chai.assert.throws(tableDefinition.buildTableGridModel.bind(undefined, tgroupElement, blueprint));
			});
		});

		describe('Row and column spanning cells', () => {
			it('can deserialize a 4x4 table with a column and row spanning cell on the first row', () => {
				coreDocument.dom.mutate(() => jsonMLMapper.parse(
					['table',
						['tgroup',
							{ 'cols': '4' },
							['colspec', { 'colname': 'c1' }],
							['colspec', { 'colname': 'c2' }],
							['colspec', { 'colname': 'c3' }],
							['colspec', { 'colname': 'c4' }],
							['tbody',
								['row', ['entry'], ['entry'], ['entry'], ['entry']],
								['row',
									['entry'],
									['entry', { 'morerows': '1', 'namest': 'c2', 'nameend': 'c3' }],
									['entry']
								],
								['row',
									['entry'],
									['entry']
								],
								['row', ['entry'], ['entry'], ['entry'], ['entry']]
							]
						]
					], documentNode));

				const tableElement = documentNode.firstChild;
				const tgroupElement = tableElement.firstChild;

				const gridModel = tableDefinition.buildTableGridModel(tgroupElement, blueprint);
				chai.assert.isOk(gridModel);

				chai.assert.equal(gridModel.getHeight(), 4);
				chai.assert.equal(gridModel.getWidth(), 4);
				chai.assert.equal(gridModel.headerRowCount, 0);

				const firstSpanningCell = gridModel.getCellAtCoordinates(1, 1);
				const secondSpanningCell = gridModel.getCellAtCoordinates(2, 1);
				const thirdSpanningCell = gridModel.getCellAtCoordinates(1, 2);
				const fourthSpanningCell = gridModel.getCellAtCoordinates(2, 2);
				chai.assert.equal(getNodeId(firstSpanningCell.element), getNodeId(secondSpanningCell.element));
				chai.assert.equal(getNodeId(secondSpanningCell.element), getNodeId(thirdSpanningCell.element));
				chai.assert.equal(getNodeId(thirdSpanningCell.element), getNodeId(fourthSpanningCell.element));
			});

			it('throws when building a gridModel from a table containing incorrect rowspans and colspans', () => {
				coreDocument.dom.mutate(() => jsonMLMapper.parse(
					['table',
						['tgroup',
							{ 'cols': '4' },
							['colspec', { 'colname': 'c1' }],
							['colspec', { 'colname': 'c2' }],
							['colspec', { 'colname': 'c3' }],
							['colspec', { 'colname': 'c4' }],
							['tbody',
								['row', ['entry'], ['entry'], ['entry'], ['entry']],
								['row',
									['entry'],
									['entry', { 'morerows': '2', 'namest': 'c2', 'nameend': 'c4' }],
									['entry']
								],
								['row',
									['entry'],
									['entry']
								],
								['row', ['entry'], ['entry'], ['entry'], ['entry']]
							]
						]
					], documentNode));

				const tableElement = documentNode.firstChild;
				const tgroupElement = tableElement.firstChild;
				chai.assert.throws(tableDefinition.buildTableGridModel.bind(undefined, tgroupElement, blueprint));
			});
		});
	});

	describe('Units of width', () => {
		it.skip('can create a table with proportional widths', () => {
			coreDocument.dom.mutate(() => jsonMLMapper.parse(
				['table',
					['tgroup',
						{ cols: 3 },
						['colspec', { colwidth: '1*' }],
						['colspec', { colwidth: '1*' }],
						['colspec', { colwidth: '2*' }],
						['tbody',
							['row', ['entry'], ['entry'], ['entry']],
							['row', ['entry'], ['entry'], ['entry']],
							['row', ['entry'], ['entry'], ['entry']]
						]
					]
				], documentNode));

			const tableElement = documentNode.firstChild;
			const tgroupElement = tableElement.firstChild;

			const gridModel = tableDefinition.buildTableGridModel(tgroupElement, blueprint);
			chai.assert.isOk(gridModel);

			chai.assert.equal(gridModel.getHeight(), 3);
			chai.assert.equal(gridModel.getWidth(), 3);

			const leftColumn = gridModel.getCellByNodeId(getNodeId(tgroupElement.lastChild.lastChild.firstChild));
			const rightColumn = gridModel.getCellByNodeId(getNodeId(tgroupElement.lastChild.lastChild.lastChild));
			chai.assert.equal(leftColumn.data.width.stringValue(), '1*');
			chai.assert.equal(rightColumn.data.width.stringValue(), '2*');
		});

		it.skip('can create a table with fixed widths', () => {
			coreDocument.dom.mutate(() => jsonMLMapper.parse(
				['table',
					['tgroup',
						{ cols: 3 },
						['colspec', { colwidth: '10pt' }],
						['colspec', { colwidth: '10pt' }],
						['colspec', { colwidth: '20pt' }],
						['tbody',
							['row', ['entry'], ['entry'], ['entry']],
							['row', ['entry'], ['entry'], ['entry']],
							['row', ['entry'], ['entry'], ['entry']]
						]
					]
				], documentNode));

			const tableElement = documentNode.firstChild;
			const tgroupElement = tableElement.firstChild;

			const gridModel = tableDefinition.buildTableGridModel(tgroupElement, blueprint);
			chai.assert.isOk(gridModel);

			chai.assert.equal(gridModel.getHeight(), 3);
			chai.assert.equal(gridModel.getWidth(), 3);

			const leftColumn = gridModel.getCellByNodeId(getNodeId(tgroupElement.lastChild.lastChild.firstChild));
			const rightColumn = gridModel.getCellByNodeId(getNodeId(tgroupElement.lastChild.lastChild.lastChild));

			chai.assert.equal(leftColumn.data.width.stringValue(), '10pt');
			chai.assert.equal(rightColumn.data.width.stringValue(), '20pt');
		});
	});
});
