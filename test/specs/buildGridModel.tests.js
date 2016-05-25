define([
	'fontoxml-blueprints',
	'fontoxml-dom-identification/getNodeId',
	'fontoxml-core',
	'fontoxml-dom-utils/jsonMLMapper',
	'slimdom',

	'fontoxml-table-flow-cals/buildGridModel',
	'fontoxml-table-flow-cals/calsTableStructure'
], function (
	blueprints,
	getNodeId,
	core,
	jsonMLMapper,
	slimdom,

	buildGridModel,
	calsTableStructure
	) {
	'use strict';

	var Blueprint = blueprints.Blueprint,
		CoreDocument = core.Document;

	describe('buildGridModel', function () {
		var documentNode,
			coreDocument,
			blueprint;

		beforeEach(function () {
			documentNode = slimdom.createDocument();
			coreDocument = new CoreDocument(documentNode);

			blueprint = new Blueprint(coreDocument.dom);
		});

		describe('buildGridModel()', function () {
			it('can build a gridModel from a basic CALS table', function () {
				coreDocument.dom.mutate(function () {
					jsonMLMapper.parse(
						['table',
							['tgroup', {
								'cols': 3
								}, ['colspec'],
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
						],
					documentNode);
				});

				var tableElement = documentNode.firstChild,
					tgroupElement = tableElement.firstChild;

				var gridModel = buildGridModel(calsTableStructure, tgroupElement, blueprint);

				chai.expect(!!gridModel).to.not.equal(false);

				chai.expect(gridModel.getHeight()).to.equal(4, 'height');
				chai.expect(gridModel.getWidth()).to.equal(3, 'width');
			});

			it('can build a gridModel from a CALS table with colnum starting a 0', function () {
				coreDocument.dom.mutate(function () {
					jsonMLMapper.parse(
						['table',
							['tgroup', {
								'cols': 3
								}, ['colspec', {colnum: 0}],
								['colspec', {colnum: 1}],
								['colspec', {colnum: 2}],
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

				var gridModel = buildGridModel(calsTableStructure, tgroupElement, blueprint);

				chai.expect(!!gridModel).to.not.equal(false);

				chai.expect(gridModel.getHeight()).to.equal(4, 'height');
				chai.expect(gridModel.getWidth()).to.equal(3, 'width');
			});

			it('can build a gridModel from a table containing comments and precessing instructions', function () {
				coreDocument.dom.mutate(function () {
					jsonMLMapper.parse(
						['table',
								['tgroup', {
									'cols': 3
									}, ['colspec'],
									['colspec'],
									['colspec'],
									['thead',
										['row',
											['entry'],
											['?someProcessingInstruction',  'someContent'],
											['entry'],
											['entry']
										]
									],
									['tbody',
										['row',
											['entry'],
											['entry'],
											['!some comment'],
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

				var gridModel = buildGridModel(calsTableStructure, tgroupElement, blueprint);

				chai.expect(!!gridModel).to.not.equal(false);

				chai.expect(gridModel.getHeight()).to.equal(4, 'height');
				chai.expect(gridModel.getWidth()).to.equal(3, 'width');
			});


			describe('colSpans', function () {
				it('can build a gridModel from a cals table containing colspans on the first row', function () {
					coreDocument.dom.mutate(function () {
						jsonMLMapper.parse([
							'table', [
								'tgroup', {
									'cols': 3
								}, [
									'colspec', {
										'colname': 'column-0',
										'colnum': '1',
										'colwidth': '1*',
										'colsep': '1',
										'rowsep': '1'
								}],	[
									'colspec', {
										'colname': 'column-1',
										'colnum': '2',
										'colwidth': '1*',
										'colsep': '1',
										'rowsep': '1'

								}],	[
									'colspec', {
										'colname': 'column-2',
										'colnum': '3',
										'colwidth': '1*',
										'colsep': '1',
										'rowsep': '1'

								}], [
									'tbody', [
										'row',	[
											'entry', {
												'namest': 'column-0',
												'colname': 'column-0',
												'nameend': 'column-1'
										}], [
											'entry', {
												'namest': 'column-2',
												'colname': 'column-2',
												'nameend': 'column-2'
											}
										]
									], [
										'row',
										['entry'],
										['entry'],
										['entry']
									], [
										'row',
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

					var gridModel = buildGridModel(calsTableStructure, tgroupElement, blueprint);

					chai.expect(!!gridModel).to.not.equal(false);

					chai.expect(gridModel.getHeight()).to.equal(3, 'height');
					chai.expect(gridModel.getWidth()).to.equal(3, 'width');

					var firstSpanningCell = gridModel.getCellAtCoordinates(0, 0);
					var secondSpanningCell = gridModel.getCellAtCoordinates(0, 1);
					chai.expect(getNodeId(firstSpanningCell.element)).to.equal(getNodeId(secondSpanningCell.element));
				});


				it('can build a gridModel from a cals table containing colspans', function () {
					coreDocument.dom.mutate(function () {
						jsonMLMapper.parse(
						['table',
							['tgroup', {
								'cols': 3
									}, ['colspec', {
										'colname': 'c1'
									}],
									['colspec', {
										'colname': 'c2'
									}],
									['colspec', {
										'colname': 'c3'
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
											['entry', {
												'namest': 'c1',
												'nameend': 'c2'
											}],
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

					var gridModel = buildGridModel(calsTableStructure, tgroupElement, blueprint);

					chai.expect(!!gridModel).to.not.equal(false);

					chai.expect(gridModel.getHeight()).to.equal(4, 'height');
					chai.expect(gridModel.getWidth()).to.equal(3, 'width');

					var firstSpanningCell = gridModel.getCellAtCoordinates(1, 0);
					var secondSpanningCell = gridModel.getCellAtCoordinates(1, 1);
					chai.expect(getNodeId(firstSpanningCell.element)).to.equal(getNodeId(secondSpanningCell.element));
				});

				it('can build a gridModel from a cals table containing colspans but not all colspecs', function () {
					coreDocument.dom.mutate(function () {
						jsonMLMapper.parse(
							['table',
								['tgroup', {
									'cols': 3
									}, ['colspec', {
										'colname': 'c1'
									}],
									['colspec', {
										'colname': 'c3'
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
											['entry', {
												'namest': 'c1',
												'nameend': 'c3'
											}],
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

					var gridModel = buildGridModel(calsTableStructure, tgroupElement, blueprint);

					chai.expect(!!gridModel).to.not.equal(false);

					chai.expect(gridModel.getHeight()).to.equal(4, 'height');
					chai.expect(gridModel.getWidth()).to.equal(3, 'width');

					var firstSpanningCell = gridModel.getCellAtCoordinates(1, 0);
					var secondSpanningCell = gridModel.getCellAtCoordinates(1, 1);
					chai.expect(getNodeId(firstSpanningCell.element)).to.equal(getNodeId(secondSpanningCell.element));
				});

				it('throws when building a gridModel from a cals table containing incorrect colspans', function () {
					coreDocument.dom.mutate(function () {
						jsonMLMapper.parse(
							['table',
								['tgroup', {
									'cols': 3
									}, ['colspec', {
										'colname': 'c1'
									}],
									['colspec', {
										'colname': 'c2'
									}],
									['colspec', {
										'colname': 'c3'
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
											['entry', {
												'namest': 'c1',
												'nameend': 'c3'
											}],
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

					chai.expect(buildGridModel.bind(undefined, calsTableStructure, tgroupElement, blueprint)).to.throw();
				});
			});

			describe('rowSpans', function () {
				it('can build a gridModel from a cals table containing rowspans', function () {
					coreDocument.dom.mutate(function () {
						jsonMLMapper.parse(
							['table',
								['tgroup', {
									'cols': 3
									}, ['colspec', {
										'colname': 'c1'
									}],
									['colspec', {
										'colname': 'c2'
									}],
									['colspec', {
										'colname': 'c3'
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
											['entry', {
												'morerows': '1'
											}],
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
							],
						documentNode);
					});

					var tableElement = documentNode.firstChild,
						tgroupElement = tableElement.firstChild;

					var gridModel = buildGridModel(calsTableStructure, tgroupElement, blueprint);

					chai.expect(!!gridModel).to.not.equal(false);

					chai.expect(gridModel.getHeight()).to.equal(4, 'height');
					chai.expect(gridModel.getWidth()).to.equal(3, 'width');

					var firstSpanningCell = gridModel.getCellAtCoordinates(1, 0);
					var secondSpanningCell = gridModel.getCellAtCoordinates(2, 0);
					chai.expect(getNodeId(firstSpanningCell.element)).to.deep.equal(getNodeId(secondSpanningCell.element));
				});

				it('can build a gridModel from a cals table containing rowspans that overlap entire rows', function () {
					coreDocument.dom.mutate(function () {
						jsonMLMapper.parse(
							['table',
								['tgroup', {
									'cols': 3
									}, ['colspec', {
										'colname': 'c1'
									}],
									['colspec', {
										'colname': 'c2'
									}],
									['colspec', {
										'colname': 'c3'
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
											['entry', {
												'morerows': '1'
											}],
											['entry', {
												'morerows': '1'
											}],
											['entry', {
												'morerows': '1'
											}]
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

					var gridModel = buildGridModel(calsTableStructure, tgroupElement, blueprint);

					chai.expect(!!gridModel).to.not.equal(false);

					chai.expect(gridModel.getHeight()).to.equal(4, 'height');
					chai.expect(gridModel.getWidth()).to.equal(3, 'width');
				});

				it('throws when building a gridModel from a cals table containing incorrect rowspans', function () {
					coreDocument.dom.mutate(function () {
						jsonMLMapper.parse(
							['table',
								['tgroup', {
									'cols': 3
									}, ['colspec', {
										'colname': 'c1'
									}],
									['colspec', {
										'colname': 'c2'
									}],
									['colspec', {
										'colname': 'c3'
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
											['entry', {
												'morerows': 3
											}],
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
							],
						documentNode);
					});

					var tableElement = documentNode.firstChild,
						tgroupElement = tableElement.firstChild;

					chai.expect(buildGridModel.bind(undefined, calsTableStructure, tgroupElement, blueprint)).to.throw();

				});

				it('can build a gridModel from a cals table containing rowspans on all cells but the middle', function () {
					coreDocument.dom.mutate(function () {
						jsonMLMapper.parse(
						['table',
							['tgroup', {
								'cols': 3
									}, ['colspec', {
										'colname': 'c1'
									}],
									['colspec', {
										'colname': 'c2'
									}],
									['colspec', {
										'colname': 'c3'
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
											['entry', {
												'namest': 'c1',
												'nameend': 'c2'
											}],
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

					var gridModel = buildGridModel(calsTableStructure, tgroupElement, blueprint);

					chai.expect(!!gridModel).to.not.equal(false);

					chai.expect(gridModel.getHeight()).to.equal(4, 'height');
					chai.expect(gridModel.getWidth()).to.equal(3, 'width');

					var firstCell = gridModel.getCellAtCoordinates(1, 2);
					chai.expect(!!firstCell).to.equal(true);
					chai.expect(firstCell.origin.row).to.equal(1, 'row');
					chai.expect(firstCell.origin.column).to.equal(2, 'column');
				});
			});

			describe('rowSpans combined with colSpans', function () {
				it('can build a gridModel from a cals table containing rowspans and colspans in the same cell', function () {
					coreDocument.dom.mutate(function () {
						jsonMLMapper.parse(
							['table',
								['tgroup', {
									'cols': 3
									}, ['colspec', {
										'colname': 'c1'
									}],
									['colspec', {
										'colname': 'c2'
									}],
									['colspec', {
										'colname': 'c3'
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
											['entry', {
												'morerows': '1',
												'namest': 'c1',
												'nameend': 'c2'
											}],
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
							],
						documentNode);
					});

					var tableElement = documentNode.firstChild,
						tgroupElement = tableElement.firstChild;

					var gridModel = buildGridModel(calsTableStructure, tgroupElement, blueprint);

					chai.expect(!!gridModel).to.not.equal(false);

					chai.expect(gridModel.getHeight()).to.equal(4, 'height');
					chai.expect(gridModel.getWidth()).to.equal(3, 'width');

					var firstSpanningCell = gridModel.getCellAtCoordinates(1, 0);
					var secondSpanningCell = gridModel.getCellAtCoordinates(2, 0);
					var thirdSpanningCell = gridModel.getCellAtCoordinates(1, 1);
					var fourthSpanningCell = gridModel.getCellAtCoordinates(2, 1);
					chai.expect(!!firstSpanningCell).to.equal(true);
					chai.expect(getNodeId(firstSpanningCell.element)).to.equal(getNodeId(secondSpanningCell.element));
					chai.expect(getNodeId(secondSpanningCell.element)).to.equal(getNodeId(thirdSpanningCell.element));
					chai.expect(getNodeId(thirdSpanningCell.element)).to.equal(getNodeId(fourthSpanningCell.element));
				});

				it('can build a table containing row and colspans on the first row', function () {
					coreDocument.dom.mutate(function () {
						jsonMLMapper.parse([
							'table', [
								'tgroup', {
									'cols': '5',
									'colsep': '1',
									'rowsep': '1'
								}, [
									'colspec', {
										'colname':'c1',
										'colwidth': '2*'
									}
								], [
									'colspec', {
										'colname':'c2',
										'colwidth': '2*'
									}
								], [
									'colspec', {
										'colname':'c3',
										'colwidth': '2*'
									}
								], [
									'colspec', {
										'colnum': '6',
										'colname':'c5',
										'colwidth': '2*'
									}
								], [
									'thead', [
										'row',  [
											'entry', {
												'namest': 'c1',
												'nameend': 'c2',
												'align': 'center'
											},
											'Horizontal span'
										], [
											'entry',
											'a3'
										], [
											'entry',
											'a4'
										], [
											'entry',
											'a5'
										]
									]
								], [
									'tbody', [
										'row', [
											'entry',
											'b1'
										], [
											'entry',
											'b2'
										], [
											'entry',
											'b3'
										], [
											'entry',
											'b4'
										], [
											'entry', {
												'morerows': '1',
												'valign': 'middle'
											},
											'Vertical span'
										]
									], [
										'row', [
											'entry'
										], [
											'entry', {
												'namest': 'c2',
												'nameend': 'c3',
												'align': 'center',
												'morerows': '1',
												'valign': 'bottom' // Hah, bum
											}
										], [
											'entry'
										]
									], [
										'row', [
											'entry',
											'd1'
										], [
											'entry',
											'd4'
										], [
											'entry',
											'd5'
										]
									]
								]
							]
						],
						documentNode);
					});

					var tgroupElement = documentNode.firstChild.firstChild;
					var tableGridModel = buildGridModel(calsTableStructure, tgroupElement, blueprint);

					chai.expect(!!tableGridModel).to.equal(true);

				});

				it('throws when building a gridModel from a cals table containing incorrect rowspans and colspans', function () {
					coreDocument.dom.mutate(function () {
						jsonMLMapper.parse(
							['table',
								['tgroup', {
									'cols': 3
									},
									['colspec', {
										'colname': 'c1'
									}],
									['colspec', {
										'colname': 'c2'
									}],
									['colspec', {
										'colname': 'c3'
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
											['entry', {
												'morerows': 3,
												'namest': 'c1',
												'nameend': 'c3'

											}],
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
							],
						documentNode);
					});

					var tableElement = documentNode.firstChild,
						tgroupElement = tableElement.firstChild;

					chai.expect(buildGridModel.bind(undefined, calsTableStructure, tgroupElement, blueprint)).to.throw();
				});
			});

			describe('units of width', function () {
				it('can create a table with proportional widths', function () {
					coreDocument.dom.mutate(function () {
						jsonMLMapper.parse(
							['table',
								['tgroup', {
									'cols': 3
									}, ['colspec', {'colwidth':'1*'}],
									['colspec', {'colwidth':'1*'}],
									['colspec', {'colwidth':'2*'}],
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

					var gridModel = buildGridModel(calsTableStructure, tgroupElement, blueprint);

					chai.expect(!!gridModel).to.not.equal(false);

					chai.expect(gridModel.getHeight()).to.equal(4, 'height');
					chai.expect(gridModel.getWidth()).to.equal(3, 'width');

					var leftColumn = gridModel.getCellByNodeId(getNodeId(tgroupElement.lastChild.lastChild.firstChild)),
						rightColumn = gridModel.getCellByNodeId(getNodeId(tgroupElement.lastChild.lastChild.lastChild));

					chai.expect(leftColumn.data.width).to.equal('25*');
					chai.expect(rightColumn.data.width).to.equal('50*');
				});

				it('can create a table with fixed widths', function () {
					coreDocument.dom.mutate(function () {
						jsonMLMapper.parse(
							['table',
								['tgroup', {
									'cols': 3
									}, ['colspec', {'colwidth':'10pt'}],
									['colspec', {'colwidth':'10pt'}],
									['colspec', {'colwidth':'20pt'}],
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

					var gridModel = buildGridModel(calsTableStructure, tgroupElement, blueprint);

					chai.expect(!!gridModel).to.not.equal(false);

					chai.expect(gridModel.getHeight()).to.equal(4, 'height');
					chai.expect(gridModel.getWidth()).to.equal(3, 'width');

					var leftColumn = gridModel.getCellByNodeId(getNodeId(tgroupElement.lastChild.lastChild.firstChild)),
						rightColumn = gridModel.getCellByNodeId(getNodeId(tgroupElement.lastChild.lastChild.lastChild));

					chai.expect(leftColumn.data.width).to.equal('10pt');
					chai.expect(rightColumn.data.width).to.equal('20pt');
				});
			});
		});
	});
});
