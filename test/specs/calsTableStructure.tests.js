import * as slimdom from 'slimdom';
import CalsTableStructure from 'fontoxml-table-flow-cals/tableStructure/CalsTableStructure';

describe('CalsTableStructure', () => {
	let documentNode,
		calsTableStructure;

	beforeEach(() => {
		documentNode = new slimdom.Document();
		calsTableStructure = new CalsTableStructure({
			table: {
				localName: 'table',
				namespaceURI: ''
			},
			tgroup: {
				namespaceURI: ''
			}
		});
	});

	describe('calsTableStructure()', () => {
		it('can be initialized', () => {});
	});

	describe('isTable()', () => {
		it('can recognize a table element',
			() => chai.assert.isTrue(calsTableStructure.isTable(documentNode.createElement('table'))));
	});

	describe('isTablePart()', function () {
		it('can recognize a table part element',
			() => chai.assert.isTrue(calsTableStructure.isTablePart(documentNode.createElement('tbody'))));
	});
});
