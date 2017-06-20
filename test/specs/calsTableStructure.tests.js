define([
	'fontoxml-blueprints',
	'fontoxml-core',
	'slimdom',
	'fontoxml-dom-utils/jsonMLMapper',

	'fontoxml-table-flow-cals/calsTableStructure'
], function (
	blueprints,
	core,
	slimdom,
	jsonMLMapper,

	calsTableStructure
	) {
	'use strict';

	var Blueprint = blueprints.Blueprint,
		CoreDocument = core.Document;

	describe('calsTableStructure', function () {
		var documentNode,
			coreDocument,
			blueprint;

		beforeEach(function () {
			documentNode = new slimdom.Document();
			coreDocument = new CoreDocument(documentNode);

			blueprint = new Blueprint(coreDocument.dom);
		});

		describe('calsTableStructure()', function () {
			it('can be initialized', function () {
			});
		});

		describe('isTable()', function () {
			it('can recognize a table element', function () {
				var result = calsTableStructure.isTable(documentNode.createElement('tgroup'));

				chai.expect(result).to.equal(true, 'is table');
			});
		});

		describe('isTablePart()', function () {
			it('can recognize a table part element', function () {
				var result = calsTableStructure.isTablePart(documentNode.createElement('tbody'));

				chai.expect(result).to.equal(true, 'is table part');
			});
		});
	});
});
