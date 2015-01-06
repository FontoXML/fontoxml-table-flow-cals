define(
	[
		'slimdom',
		'fontoxml-dom-utils',
		'fontoxml-core',
		'fontoxml-blueprints',

		'fontoxml-table-flow',

		'fontoxml-table-flow-cals/api/createDefaultColSpec',
		'fontoxml-table-flow-cals/api/createDefaultRowSpec',
		'fontoxml-table-flow-cals/api/createDefaultCellSpec',

		'fontoxml-table-flow-cals/api/tableGridModelToCalsTable',
	],
	function (
		slimdom,
		domUtils,
		core,
		blueprints,

		tableFlow,

		getDefaultColSpec,
		getDefaultRowSpec,
		getDefaultCellSpec,

		tableGridModelToCalsTable
		) {
		'use strict';

		var CoreDocument = core.Document,
			Blueprint = blueprints.Blueprint,
			BlueprintRange = blueprints.BlueprintRange,
			BlueprintPosition = blueprints.BlueprintPosition,
			jsonMLMapper = domUtils.jsonMLMapper,
			domInfo = domUtils.domInfo,
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

		var createTable = createNewTableCreater(
				'entry',
				getDefaultRowSpec,
				getDefaultColSpec,
				getDefaultCellSpec);

		describe('tableGridModelToCalsTable', function() {
			var documentNode,
				coreDocument,
				blueprint,
				tgroupNode;

			beforeEach(function () {
				documentNode = slimdom.createDocument();
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

			it('can serialize a calsTable in a basic one by one GridModel to an actual cals table', function() {
				var entryElement = documentNode.createElement('entry');

				// Create a new one-by-one table
				var tableGridModel = createTable(1, 1, true, documentNode);

				var success = tableGridModelToCalsTable(tableGridModel, tgroupNode, blueprint, stubFormat);
				chai.expect(success).to.equal(true);

				blueprint.realize();

				chai.expect(jsonMLMapper.serialize(documentNode.firstChild)).to.deep.equal([
					'table', {
						'frame': 'none'
						}, [
						'tgroup', {
							'cols': '1'
						}, [
							'colspec', {
								'colname': 'column-0',
								'colnum': '0',
								'colwidth': '1*',
								'colsep': '1',
								'rowsep': '1'

							}
							], [
							'tbody', [
								'row', [
									'entry', {
										'colname': 'column-0',
										'namest': 'column-0',
										'colsep': '1',
										'rowsep': '1',
										'nameend': 'column-0'
									}
								]
							]
						]
					]
				]);
			});

			it('can serialize a calsTable in a basic n by n GridModel to an actual cals table', function() {
				// Create a new four-by-four table
				var tableGridModel = createTable(3, 4, true, documentNode);

				var success = tableGridModelToCalsTable(tableGridModel, tgroupNode, blueprint, stubFormat);
				chai.expect(success).to.equal(true);

				blueprint.realize();

				chai.expect(jsonMLMapper.serialize(documentNode.firstChild)).to.deep.equal([
					'table', {
						'frame': 'none'
					}, [
						'tgroup', {
							'cols': '4'
						}, [
							'colspec', {
								'colname': 'column-0',
								'colnum': '0',
								'colwidth': '1*',
								'colsep': '1',
								'rowsep': '1'
							}
						], [
							'colspec', {
								'colname': 'column-1',
								'colnum': '1',
								'colwidth': '1*',
								'colsep': '1',
								'rowsep': '1'
							}
						], [
							'colspec', {
								'colname': 'column-2',
								'colnum': '2',
								'colwidth': '1*',
								'colsep': '1',
								'rowsep': '1'
							}
						], [
							'colspec', {
								'colname': 'column-3',
								'colnum': '3',
								'colwidth': '1*',
								'colsep': '1',
								'rowsep': '1'
							}
						], [
							'thead', [
								'row', [
									'entry', {
										'colname': 'column-0',
										'namest': 'column-0',
										'colsep': '1',
										'rowsep': '1',
										'nameend': 'column-0',
									}
								], [
									'entry', {
										'colname': 'column-1',
										'namest': 'column-1',
										'colsep': '1',
										'rowsep': '1',
										'nameend': 'column-1',
									}
								], [
									'entry', {
										'colname': 'column-2',
										'namest': 'column-2',
										'colsep': '1',
										'rowsep': '1',
										'nameend': 'column-2',
									}
								], [
									'entry', {
										'colname': 'column-3',
										'namest': 'column-3',
										'colsep': '1',
										'rowsep': '1',
										'nameend': 'column-3',
									}
								]
							]
						], [
							'tbody', [
								'row', [
									'entry', {
										'colname': 'column-0',
										'namest': 'column-0',
										'colsep': '1',
										'rowsep': '1',
										'nameend': 'column-0',
									}
								], [
									'entry', {
										'colname': 'column-1',
										'namest': 'column-1',
										'colsep': '1',
										'rowsep': '1',
										'nameend': 'column-1',
									}
								], [
									'entry', {
										'colname': 'column-2',
										'namest': 'column-2',
										'colsep': '1',
										'rowsep': '1',
										'nameend': 'column-2',
									}
								], [
									'entry', {
										'colname': 'column-3',
										'namest': 'column-3',
										'colsep': '1',
										'rowsep': '1',
										'nameend': 'column-3',
									}
								]
							], [
								'row', [
									'entry', {
										'colname': 'column-0',
										'namest': 'column-0',
										'colsep': '1',
										'rowsep': '1',
										'nameend': 'column-0',
									}
								], [
									'entry', {
										'colname': 'column-1',
										'namest': 'column-1',
										'colsep': '1',
										'rowsep': '1',
										'nameend': 'column-1',
									}
								], [
									'entry', {
										'colname': 'column-2',
										'namest': 'column-2',
										'colsep': '1',
										'rowsep': '1',
										'nameend': 'column-2',
									}
								], [
									'entry', {
										'colname': 'column-3',
										'namest': 'column-3',
										'colsep': '1',
										'rowsep': '1',
										'nameend': 'column-3',
									}
								]
							]
						]
					]
				]);
			});

			it('can serialize a calsTable in a GridModel containing colspans to an actual cals table', function() {
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
						'frame': 'none'
					}, [
						'tgroup', {
							'cols': '4'
							}, [
								'colspec', {
									'colname': 'column-0',
									'colnum': '0',
									'colwidth': '1*',
									'colsep': '1',
									'rowsep': '1'
								}
							], [
								'colspec', {
									'colname': 'column-1',
									'colnum': '1',
									'colwidth': '1*',
									'colsep': '1',
									'rowsep': '1'
								}
							], [
								'colspec', {
									'colname': 'column-2',
									'colnum': '2',
									'colwidth': '1*',
									'colsep': '1',
									'rowsep': '1'
								}
							], [
								'colspec', {
									'colname': 'column-3',
									'colnum': '3',
									'colwidth': '1*',
									'colsep': '1',
									'rowsep': '1'
								}
							], [
							'thead', [
								'row', [
									'entry', {
										'colname': 'column-0',
										'namest': 'column-0',
										'colsep': '1',
										'rowsep': '1',
										'nameend': 'column-0',
									}
								], [
									'entry', {
										'colname': 'column-1',
										'namest': 'column-1',
										'colsep': '1',
										'rowsep': '1',
										'nameend': 'column-1',
									}
								], [
									'entry', {
										'colname': 'column-2',
										'namest': 'column-2',
										'colsep': '1',
										'rowsep': '1',
										'nameend': 'column-2',
									}
								], [
									'entry', {
										'colname': 'column-3',
										'namest': 'column-3',
										'colsep': '1',
										'rowsep': '1',
										'nameend': 'column-3',
									}
								]
							]
						], [
							'tbody', [
								'row', [
									'entry', {
										'colname': 'column-0',
										'namest': 'column-0',
										'colsep': '1',
										'rowsep': '1',
										'nameend': 'column-0',
									}
								], [
									'entry', {
										'colname': 'column-1',
										'namest': 'column-1',
										'colsep': '1',
										'rowsep': '1',
										'nameend': 'column-2',
										'morerows': '1'
									}
								], [
									'entry', {
										'colname': 'column-3',
										'namest': 'column-3',
										'colsep': '1',
										'rowsep': '1',
										'nameend': 'column-3',
									}
								]
							], [
								'row', [
									'entry', {
										'colname': 'column-0',
										'namest': 'column-0',
										'colsep': '1',
										'rowsep': '1',
										'nameend': 'column-0',
									}
								], [
									'entry', {
										'colname': 'column-3',
										'namest': 'column-3',
										'colsep': '1',
										'rowsep': '1',
										'nameend': 'column-3',
									}
								]
							]
						]
					]
				]);
			});
		});
	}
);
