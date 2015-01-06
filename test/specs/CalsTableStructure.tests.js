define(
	[
		'slimdom',
		'fontoxml-dom-utils',
		'fontoxml-core',
		'fontoxml-blueprints',

		'fontoxml-table-flow-cals/api/CalsTableStructure',
	],
	function (
		slimdom,
		domUtils,
		core,
		blueprints,

		calsTableStructure
		) {
		'use strict';

		var CoreDocument = core.Document,
			Blueprint = blueprints.Blueprint,
			BlueprintRange = blueprints.BlueprintRange,
			BlueprintPosition = blueprints.BlueprintPosition,
			jsonMLMapper = domUtils.jsonMLMapper,
			domInfo = domUtils.domInfo;

		describe('calsTableStructure', function() {
			var documentNode,
				coreDocument,
				blueprint;

			beforeEach(function () {
				documentNode = slimdom.createDocument();
				coreDocument = new CoreDocument(documentNode);

				blueprint = new Blueprint(coreDocument.dom);
			});

			describe('calsTableStructure()', function() {
				it('can be initialized', function() {
				});
			});

			describe('isTable()', function() {
				it('can recognize a table element', function() {
					var result = calsTableStructure.isTable(documentNode.createElement('tgroup'));

					chai.expect(result).to.equal(true, 'is table');
				});
			});

			describe('isTablePart()', function() {
				it('can recognize a table part element', function() {
					var result = calsTableStructure.isTablePart(documentNode.createElement('tbody'));

					chai.expect(result).to.equal(true, 'is table part');
				});
			});

		/*	describe('getColumnSpecifications()', function () {
				it('Can specify the correct columns specifications from the source XML', function() {
					coreDocument.dom.mutate(function () {
						jsonMLMapper.parse(
							['table',
								['tgroup',
									['colspec', {
										'colname': 'c1',
										'colwidth': '1*' // The 2* makes the col size proportional
									}],
									['colspec', {
										'colname': 'c2',
										'colwidth': '2*'
									}],
									['colspec', {
										'colname': 'c3',
										'colwidth': '3*'
									}],
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
							],
						documentNode);
					});

					var tableElement = documentNode.firstChild,
						tgroupElement = tableElement.firstChild;

					var colSpecs = calsTableStructure.getColumnSpecifications(tgroupElement);
					chai.expect(colSpecs.isProportion).to.equal(true, 'isProportion');
					chai.expect(colSpecs.colwidths).to.deep.equal({
						'c1': '1*',
						'c2': '2*',
						'c3': '3*'
					}, 'isProportion');
				});

			});*/
		});
	}
);
