import readOnlyBlueprint from 'fontoxml-blueprints/src/readOnlyBlueprint';
import * as slimdom from 'slimdom';
import CalsTableDefinition from 'fontoxml-table-flow-cals/src/table-definition/CalsTableDefinition';

describe('CalsTableDefinition', () => {
	let documentNode;
	let tableNode;
	let rowNode;
	let cellNode;
	let tableDefinition;

	beforeEach(() => {
		documentNode = new slimdom.Document();
		tableNode = documentNode.createElement('tgroup');
		documentNode.appendChild(tableNode);
		rowNode = documentNode.createElement('row');
		tableNode.appendChild(rowNode);
		cellNode = documentNode.createElement('entry');
		rowNode.appendChild(cellNode);
		tableDefinition = new CalsTableDefinition({
			table: {
				localName: 'table',
			},
		});
	});

	describe('CalsTableDefinition()', () => {
		it('can be initialized', () => {});
	});

	describe('isTable()', () => {
		it('can recognize a table element', () =>
			chai.assert.isTrue(
				tableDefinition.isTable(tableNode, readOnlyBlueprint)
			));
	});

	describe('isTableCell()', () => {
		it('can recognize a cell element', () =>
			chai.assert.isTrue(
				tableDefinition.isTableCell(cellNode, readOnlyBlueprint)
			));
	});

	describe('isTablePart()', () => {
		it('can recognize a table part', () =>
			chai.assert.isTrue(
				tableDefinition.isTablePart(rowNode, readOnlyBlueprint)
			));
	});

	describe('addWidthsStrategy()', () => {
		it('width is determined by *', () => {
			chai.assert.equal(
				tableDefinition.addWidthsStrategy('*', '*'),
				'2*'
			);
		});

		it('width is empty', () => {
			chai.assert.equal(tableDefinition.addWidthsStrategy('', ''), '');
		});

		it('width is the sum of the previous widths', () => {
			chai.assert.equal(
				tableDefinition.addWidthsStrategy('2px', '2px'),
				'4px'
			);
		});
	});

	describe('divideWidthByTwoStrategy()', () => {
		it('width is determined by *', () => {
			chai.assert.equal(
				tableDefinition.divideWidthByTwoStrategy('2*'),
				'1*'
			);
		});

		it('width is empty', () => {
			chai.assert.equal(tableDefinition.divideWidthByTwoStrategy(''), '');
		});

		it('width is the division by 2 of the previous width', () => {
			chai.assert.equal(
				tableDefinition.divideWidthByTwoStrategy('4px'),
				'2px'
			);
		});
	});
});
