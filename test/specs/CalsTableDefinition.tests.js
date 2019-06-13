import readOnlyBlueprint from 'fontoxml-blueprints/readOnlyBlueprint';
import * as slimdom from 'slimdom';
import CalsTableDefinition from 'fontoxml-table-flow-cals/table-definition/CalsTableDefinition';

describe('CalsTableDefinition', () => {
	let documentNode;
	let tableDefinition;

	beforeEach(() => {
		documentNode = new slimdom.Document();
		tableDefinition = new CalsTableDefinition({
			table: {
				localName: 'table'
			}
		});
	});

	describe('CalsTableDefinition()', () => {
		it('can be initialized', () => {});
	});

	describe('isTable()', () => {
		it('can recognize a table element',
			() => chai.assert.isTrue(tableDefinition.isTable(documentNode.createElement('table'), readOnlyBlueprint)));
	});

	describe('isTableCell()', () => {
		it('can recognize a cell element',
			() => chai.assert.isTrue(tableDefinition.isTableCell(documentNode.createElement('entry'), readOnlyBlueprint)));
	});

	describe('isTablePart()', () => {
		it('can recognize a table part',
			() => chai.assert.isTrue(tableDefinition.isTablePart(documentNode.createElement('row'), readOnlyBlueprint)));
	});
});
