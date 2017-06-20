define([
	'fontoxml-blueprints',
	'fontoxml-core',
	'fontoxml-dom-utils/jsonMLMapper',
	'fontoxml-table-flow',
	'slimdom',

	'fontoxml-table-flow-cals/sx/createDefaultColSpec',
	'fontoxml-table-flow-cals/sx/createDefaultRowSpec',
	'fontoxml-table-flow-cals/sx/createDefaultCellSpec',
	'fontoxml-table-flow-cals/tableGridModelToCalsTable'
], function (
	blueprints,
	core,
	jsonMLMapper,
	tableFlow,
	slimdom,

	createDefaultColSpec,
	createDefaultRowSpec,
	createDefaultCellSpec,

	tableGridModelToCalsTable
	) {
	'use strict';

	var Blueprint = blueprints.Blueprint,
		CoreDocument = core.Document,
		createNewTableCreater = tableFlow.primitives.createNewTableCreater;

	var stubFormat = {
			synthesizer: {
				completeStructure: function () {
					return true;
				}
			},
			metadata: {
				get: function (option, node) {
					return false;
				}
			}
		};

	var createTable = createNewTableCreater('entry', createDefaultRowSpec, createDefaultColSpec, createDefaultCellSpec);

	describe('tableGridModelToCalsTable', function () {
		var documentNode,
			coreDocument,
			blueprint,
			tgroupNode;

		beforeEach(function () {
			documentNode = new slimdom.Document();
			coreDocument = new CoreDocument(documentNode);

			blueprint = new Blueprint(coreDocument.dom);

			tgroupNode = documentNode.createElement('tgroup');
			var tbodyNode = documentNode.createElement('tbody');
			var tableNode = documentNode.createElement('table');

			coreDocument.dom.mutate(function () {
				tgroupNode.appendChild(tbodyNode);
				tableNode.appendChild(tgroupNode);
				documentNode.appendChild(tableNode);
			});
		});

		it('can serialize a calsTable in a basic one by one GridModel to an actual cals table', function () {
			// Create a new one-by-one table
			var tableGridModel = createTable(1, 1, true, documentNode);

			var success = tableGridModelToCalsTable(tableGridModel, tgroupNode, blueprint, stubFormat);
			chai.expect(success).to.equal(true);

			blueprint.realize();

			chai.expect(jsonMLMapper.serialize(documentNode.firstChild)).to.deep.equal([
				'table', {
					'frame': 'all'
					}, [
					'tgroup', {
						'cols': '1'
					}, [
						'colspec', {
							'colname': 'column-0',
							'colnum': '1',
							'colwidth': '1*',
							'colsep': '1',
							'rowsep': '1'

						}
						], [
						'tbody', [
							'row', [
								'entry', {
									'colname': 'column-0',
									'colsep': '1',
									'rowsep': '1'
								}
							]
						]
					]
				]
			]);
		});

		it('can serialize a calsTable in a basic n by n GridModel to an actual cals table', function () {
			// Create a new four-by-four table
			var tableGridModel = createTable(3, 4, true, documentNode);

			var success = tableGridModelToCalsTable(tableGridModel, tgroupNode, blueprint, stubFormat);
			chai.expect(success).to.equal(true);

			blueprint.realize();

			chai.expect(jsonMLMapper.serialize(documentNode.firstChild)).to.deep.equal([
				'table', {
					'frame': 'all'
				}, [
					'tgroup', {
						'cols': '4'
					}, [
						'colspec', {
							'colname': 'column-0',
							'colnum': '1',
							'colwidth': '1*',
							'colsep': '1',
							'rowsep': '1'
						}
					], [
						'colspec', {
							'colname': 'column-1',
							'colnum': '2',
							'colwidth': '1*',
							'colsep': '1',
							'rowsep': '1'
						}
					], [
						'colspec', {
							'colname': 'column-2',
							'colnum': '3',
							'colwidth': '1*',
							'colsep': '1',
							'rowsep': '1'
						}
					], [
						'colspec', {
							'colname': 'column-3',
							'colnum': '4',
							'colwidth': '1*',
							'colsep': '1',
							'rowsep': '1'
						}
					], [
						'thead', [
							'row', [
								'entry', {
									'colname': 'column-0',
									'colsep': '1',
									'rowsep': '1'
								}
							], [
								'entry', {
									'colname': 'column-1',
									'colsep': '1',
									'rowsep': '1'
								}
							], [
								'entry', {
									'colname': 'column-2',
									'colsep': '1',
									'rowsep': '1'
								}
							], [
								'entry', {
									'colname': 'column-3',
									'colsep': '1',
									'rowsep': '1'
								}
							]
						]
					], [
						'tbody', [
							'row', [
								'entry', {
									'colname': 'column-0',
									'colsep': '1',
									'rowsep': '1'
								}
							], [
								'entry', {
									'colname': 'column-1',
									'colsep': '1',
									'rowsep': '1'
								}
							], [
								'entry', {
									'colname': 'column-2',
									'colsep': '1',
									'rowsep': '1'
								}
							], [
								'entry', {
									'colname': 'column-3',
									'colsep': '1',
									'rowsep': '1'
								}
							]
						], [
							'row', [
								'entry', {
									'colname': 'column-0',
									'colsep': '1',
									'rowsep': '1'
								}
							], [
								'entry', {
									'colname': 'column-1',
									'colsep': '1',
									'rowsep': '1'
								}
							], [
								'entry', {
									'colname': 'column-2',
									'colsep': '1',
									'rowsep': '1'
								}
							], [
								'entry', {
									'colname': 'column-3',
									'colsep': '1',
									'rowsep': '1'
								}
							]
						]
					]
				]
			]);
		});

		it('can serialize a calsTable in a GridModel containing colspans to an actual cals table', function () {
			// Create a new three-by-four table
			var tableGridModel = createTable(3, 4, true, documentNode);

			var spanningCell = tableGridModel.getCellAtCoordinates(1, 1);
			spanningCell.size.rows = 2;
			spanningCell.size.columns = 2;

			tableGridModel.setCellAtCoordinates(spanningCell, 1, 1);
			tableGridModel.setCellAtCoordinates(spanningCell, 1, 2);
			tableGridModel.setCellAtCoordinates(spanningCell, 2, 1);
			tableGridModel.setCellAtCoordinates(spanningCell, 2, 2);


			var success = tableGridModelToCalsTable(tableGridModel, tgroupNode, blueprint, stubFormat);
			chai.expect(success).to.equal(true);

			blueprint.realize();

			chai.expect(jsonMLMapper.serialize(documentNode.firstChild)).to.deep.equal([
				'table', {
					'frame': 'all'
				}, [
					'tgroup', {
						'cols': '4'
						}, [
							'colspec', {
								'colname': 'column-0',
								'colnum': '1',
								'colwidth': '1*',
								'colsep': '1',
								'rowsep': '1'
							}
						], [
							'colspec', {
								'colname': 'column-1',
								'colnum': '2',
								'colwidth': '1*',
								'colsep': '1',
								'rowsep': '1'
							}
						], [
							'colspec', {
								'colname': 'column-2',
								'colnum': '3',
								'colwidth': '1*',
								'colsep': '1',
								'rowsep': '1'
							}
						], [
							'colspec', {
								'colname': 'column-3',
								'colnum': '4',
								'colwidth': '1*',
								'colsep': '1',
								'rowsep': '1'
							}
						], [
						'thead', [
							'row', [
								'entry', {
									'colname': 'column-0',
									'colsep': '1',
									'rowsep': '1'
								}
							], [
								'entry', {
									'colname': 'column-1',
									'colsep': '1',
									'rowsep': '1'
								}
							], [
								'entry', {
									'colname': 'column-2',
									'colsep': '1',
									'rowsep': '1'
								}
							], [
								'entry', {
									'colname': 'column-3',
									'colsep': '1',
									'rowsep': '1'
								}
							]
						]
					], [
						'tbody', [
							'row', [
								'entry', {
									'colname': 'column-0',
									'colsep': '1',
									'rowsep': '1'
								}
							], [
								'entry', {
									'namest': 'column-1',
									'colsep': '1',
									'rowsep': '1',
									'nameend': 'column-2',
									'morerows': '1'
								}
							], [
								'entry', {
									'colname': 'column-3',
									'colsep': '1',
									'rowsep': '1'
								}
							]
						], [
							'row', [
								'entry', {
									'colname': 'column-0',
									'colsep': '1',
									'rowsep': '1'
								}
							], [
								'entry', {
									'colname': 'column-3',
									'colsep': '1',
									'rowsep': '1'
								}
							]
						]
					]
				]
			]);
		});
	});
});
