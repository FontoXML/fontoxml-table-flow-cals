import Blueprint from 'fontoxml-blueprints/Blueprint';
import CoreDocument from 'fontoxml-core/Document';
import jsonMLMapper from 'fontoxml-dom-utils/jsonMLMapper';
import * as slimdom from 'slimdom';

import CalsTableDefinition from 'fontoxml-table-flow-cals/table-definition/CalsTableDefinition';

import namespaceManager from 'fontoxml-dom-namespaces/namespaceManager';

namespaceManager.addNamespace('somenamespace', 'somenamespace-uri');

const stubFormat = {
	synthesizer: {
		completeStructure: () => true
	},
	metadata: {
		get: (_option, _node) => false
	},
	validator: {
		canContain: () => true
	}
};

describe('tableGridModelToCalsTable with namespaces', () => {
	let documentNode, coreDocument, blueprint, tgroupNode, calsTableStructure, createTable;

	beforeEach(() => {
		documentNode = new slimdom.Document();
		coreDocument = new CoreDocument(documentNode);

		blueprint = new Blueprint(coreDocument.dom);

		tgroupNode = namespaceManager.createElementNS(documentNode, 'somenamespace-uri', 'tgroup');
		const tbodyNode = namespaceManager.createElementNS(
			documentNode,
			'somenamespace-uri',
			'tbody'
		);
		const tableNode = namespaceManager.createElementNS(
			documentNode,
			'somenamespace-uri',
			'table'
		);

		calsTableStructure = new CalsTableDefinition({
			table: {
				localName: 'table',
				namespaceURI: 'somenamespace-uri'
			},
			tgroup: {
				namespaceURI: 'somenamespace-uri'
			}
		});
		createTable = calsTableStructure.getTableGridModelBuilder();

		coreDocument.dom.mutate(() => {
			tgroupNode.appendChild(tbodyNode);
			tableNode.appendChild(tgroupNode);
			documentNode.appendChild(tableNode);
		});
	});

	it('can serialize a calsTable in a basic one by one GridModel to an actual cals table', () => {
		// Create a new one-by-one table
		const tableGridModel = createTable(1, 1, true, documentNode);

		const success = calsTableStructure.applyToDom(
			tableGridModel,
			tgroupNode,
			blueprint,
			stubFormat
		);
		chai.assert.isTrue(success);

		blueprint.realize();
		chai.assert.deepEqual(jsonMLMapper.serialize(documentNode.firstChild), [
			'somenamespace:table',
			{ frame: 'all' },
			[
				'somenamespace:tgroup',
				{ cols: '1' },
				[
					'somenamespace:colspec',
					{ colname: 'column-0', colnum: '1', colwidth: '1*', colsep: '1', rowsep: '1' }
				],
				[
					'somenamespace:tbody',
					[
						'somenamespace:row',
						['somenamespace:entry', { colname: 'column-0', colsep: '1', rowsep: '1' }]
					]
				]
			]
		]);
	});

	it('can serialize a calsTable in a basic n by n GridModel to an actual cals table', () => {
		// Create a new four-by-four table
		const tableGridModel = createTable(3, 4, true, documentNode);

		const success = calsTableStructure.applyToDom(
			tableGridModel,
			tgroupNode,
			blueprint,
			stubFormat
		);
		chai.assert.isTrue(success);

		blueprint.realize();
		chai.assert.deepEqual(jsonMLMapper.serialize(documentNode.firstChild), [
			'somenamespace:table',
			{ frame: 'all' },
			[
				'somenamespace:tgroup',
				{ cols: '4' },
				[
					'somenamespace:colspec',
					{ colname: 'column-0', colnum: '1', colwidth: '1*', colsep: '1', rowsep: '1' }
				],
				[
					'somenamespace:colspec',
					{ colname: 'column-1', colnum: '2', colwidth: '1*', colsep: '1', rowsep: '1' }
				],
				[
					'somenamespace:colspec',
					{ colname: 'column-2', colnum: '3', colwidth: '1*', colsep: '1', rowsep: '1' }
				],
				[
					'somenamespace:colspec',
					{ colname: 'column-3', colnum: '4', colwidth: '1*', colsep: '1', rowsep: '1' }
				],
				[
					'somenamespace:thead',
					[
						'somenamespace:row',
						['somenamespace:entry', { colname: 'column-0', colsep: '1', rowsep: '1' }],
						['somenamespace:entry', { colname: 'column-1', colsep: '1', rowsep: '1' }],
						['somenamespace:entry', { colname: 'column-2', colsep: '1', rowsep: '1' }],
						['somenamespace:entry', { colname: 'column-3', colsep: '1', rowsep: '1' }]
					]
				],
				[
					'somenamespace:tbody',
					[
						'somenamespace:row',
						['somenamespace:entry', { colname: 'column-0', colsep: '1', rowsep: '1' }],
						['somenamespace:entry', { colname: 'column-1', colsep: '1', rowsep: '1' }],
						['somenamespace:entry', { colname: 'column-2', colsep: '1', rowsep: '1' }],
						['somenamespace:entry', { colname: 'column-3', colsep: '1', rowsep: '1' }]
					],
					[
						'somenamespace:row',
						['somenamespace:entry', { colname: 'column-0', colsep: '1', rowsep: '1' }],
						['somenamespace:entry', { colname: 'column-1', colsep: '1', rowsep: '1' }],
						['somenamespace:entry', { colname: 'column-2', colsep: '1', rowsep: '1' }],
						['somenamespace:entry', { colname: 'column-3', colsep: '1', rowsep: '1' }]
					]
				]
			]
		]);
	});

	it('can serialize a calsTable in a GridModel containing colspans to an actual cals table', () => {
		// Create a new three-by-four table
		const tableGridModel = createTable(3, 4, true, documentNode);

		const spanningCell = tableGridModel.getCellAtCoordinates(1, 1);
		spanningCell.size.rows = 2;
		spanningCell.size.columns = 2;

		tableGridModel.setCellAtCoordinates(spanningCell, 1, 1);
		tableGridModel.setCellAtCoordinates(spanningCell, 1, 2);
		tableGridModel.setCellAtCoordinates(spanningCell, 2, 1);
		tableGridModel.setCellAtCoordinates(spanningCell, 2, 2);

		const success = calsTableStructure.applyToDom(
			tableGridModel,
			tgroupNode,
			blueprint,
			stubFormat
		);
		chai.assert.isTrue(success);

		blueprint.realize();
		chai.assert.deepEqual(jsonMLMapper.serialize(documentNode.firstChild), [
			'somenamespace:table',
			{ frame: 'all' },
			[
				'somenamespace:tgroup',
				{ cols: '4' },
				[
					'somenamespace:colspec',
					{ colname: 'column-0', colnum: '1', colwidth: '1*', colsep: '1', rowsep: '1' }
				],
				[
					'somenamespace:colspec',
					{ colname: 'column-1', colnum: '2', colwidth: '1*', colsep: '1', rowsep: '1' }
				],
				[
					'somenamespace:colspec',
					{ colname: 'column-2', colnum: '3', colwidth: '1*', colsep: '1', rowsep: '1' }
				],
				[
					'somenamespace:colspec',
					{ colname: 'column-3', colnum: '4', colwidth: '1*', colsep: '1', rowsep: '1' }
				],
				[
					'somenamespace:thead',
					[
						'somenamespace:row',
						['somenamespace:entry', { colname: 'column-0', colsep: '1', rowsep: '1' }],
						['somenamespace:entry', { colname: 'column-1', colsep: '1', rowsep: '1' }],
						['somenamespace:entry', { colname: 'column-2', colsep: '1', rowsep: '1' }],
						['somenamespace:entry', { colname: 'column-3', colsep: '1', rowsep: '1' }]
					]
				],
				[
					'somenamespace:tbody',
					[
						'somenamespace:row',
						['somenamespace:entry', { colname: 'column-0', colsep: '1', rowsep: '1' }],
						[
							'somenamespace:entry',
							{
								namest: 'column-1',
								colsep: '1',
								rowsep: '1',
								nameend: 'column-2',
								morerows: '1'
							}
						],
						['somenamespace:entry', { colname: 'column-3', colsep: '1', rowsep: '1' }]
					],
					[
						'somenamespace:row',
						['somenamespace:entry', { colname: 'column-0', colsep: '1', rowsep: '1' }],
						['somenamespace:entry', { colname: 'column-3', colsep: '1', rowsep: '1' }]
					]
				]
			]
		]);
	});
});
