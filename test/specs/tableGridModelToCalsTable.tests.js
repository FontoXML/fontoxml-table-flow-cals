import blueprints from 'fontoxml-blueprints';
import core from 'fontoxml-core';
import jsonMLMapper from 'fontoxml-dom-utils/jsonMLMapper';
import tableFlow from 'fontoxml-table-flow';
import * as slimdom from 'slimdom';
import { evaluateXPathToBoolean } from 'fontoxpath';

import namespaceManager from 'fontoxml-dom-namespaces/namespaceManager';

import createDefaultColSpec from 'fontoxml-table-flow-cals/tableStructure/specs/createDefaultColSpec';
import createDefaultRowSpec from 'fontoxml-table-flow-cals/tableStructure/specs/createDefaultRowSpec';
import createDefaultCellSpec from 'fontoxml-table-flow-cals/tableStructure/specs/createDefaultCellSpec';
import tableGridModelToCalsTable from 'fontoxml-table-flow-cals/tableStructure/tableGridModelToCalsTable';
import CalsTableStructure from 'fontoxml-table-flow-cals/tableStructure/CalsTableStructure';
import tableStructureManager from 'fontoxml-table-flow/tableStructureManager';

const Blueprint = blueprints.Blueprint;
const CoreDocument = core.Document;
const createNewTableCreater = tableFlow.primitives.createNewTableCreater;

const stubFormat = {
		synthesizer: {
			completeStructure: () => true
		},
		metadata: {
			get: (_option, _node) => false
		}
	};

function createTable (rows, cols, hasHeader, document, entryName = 'entry') {
	return createNewTableCreater(entryName, createDefaultRowSpec, createDefaultColSpec, createDefaultCellSpec)(rows, cols, hasHeader, document);
}

describe('tableGridModelToCalsTable', () => {
	let documentNode,
		coreDocument,
		blueprint,
		tgroupNode,
		calsTableStructure;

	beforeEach(() => {
		documentNode = new slimdom.Document();
		coreDocument = new CoreDocument(documentNode);

		blueprint = new Blueprint(coreDocument.dom);

		tgroupNode = documentNode.createElement('tgroup');
		const tbodyNode = documentNode.createElement('tbody');
		const tableNode = documentNode.createElement('table');

		calsTableStructure = new CalsTableStructure({
			table: {
				localName: 'table',
				namespaceURI: null
			},
			tgroup: {
				namespaceURI: null
			}
		});
		tableStructureManager.addTableStructure(calsTableStructure);

		coreDocument.dom.mutate(() => {
			tgroupNode.appendChild(tbodyNode);
			tableNode.appendChild(tgroupNode);
			documentNode.appendChild(tableNode);
		});
	});

	it('can serialize a calsTable in a basic one by one GridModel to an actual cals table', () => {
		// Create a new one-by-one table
		const tableGridModel = createTable(1, 1, true, documentNode);

		const success = tableGridModelToCalsTable(calsTableStructure, tableGridModel, tgroupNode, blueprint, stubFormat);
		chai.assert.isTrue(success, 'success');

		blueprint.realize();
		chai.assert.deepEqual(jsonMLMapper.serialize(documentNode.firstChild),
			['table',
				{ frame: 'all' },
				['tgroup',
					{ cols: '1' },
					['colspec', { colname: 'column-0', colnum: '1', colwidth: '1*', colsep: '1', rowsep: '1' }],
					['tbody',
						['row',
							['entry', { colname: 'column-0', colsep: '1', rowsep: '1' }]
						]
					]
				]
			]);
	});

	it('can serialize a calsTable in a basic one by one GridModel to an actual cals table containing namespaces and non-default names', () => {
		namespaceManager.addNamespace('ns1', 'http://example.com/ns1');
		namespaceManager.addNamespace('ns2', 'http://example.com/ns2');

		// Create a new one-by-one table
		const tableGridModel = createTable(1, 1, true, documentNode, 'ns2:entry');
		const calsTableStructureWithNamespaces = new CalsTableStructure({
			table: {
				localName: 'matrix',
				namespaceURI: 'http://example.com/ns1'
			},
			tgroup: {
				namespaceURI: 'http://example.com/ns2'
			}
		});

		const tableNodeWithNamespace = documentNode.createElementNS('http://example.com/ns1', 'ns1:matrix');
		const tgroupNodeWithNamespace = documentNode.createElementNS('http://example.com/ns2', 'ns2:tgroup');
		tableNodeWithNamespace.appendChild(tgroupNodeWithNamespace);

		const success = tableGridModelToCalsTable(calsTableStructureWithNamespaces, tableGridModel, tgroupNodeWithNamespace, blueprint, stubFormat);
		chai.assert.isTrue(success, 'success');

		blueprint.realize();
		chai.assert.isTrue(
			evaluateXPathToBoolean(
				'deep-equal($a, $b)',
				null,
				null,
				{
					a: tableNodeWithNamespace,
					b: new DOMParser().parseFromString([
						'<matrix frame="all" xmlns="http://example.com/ns1">',
						'<tgroup cols="1" xmlns="http://example.com/ns2">',
						'<colspec colname="column-0" colnum="1" colwidth="1*" colsep="1" rowsep="1"/>',
						'<tbody><row><entry colname="column-0" colsep="1" rowsep="1"></entry></row></tbody>',
						'</tgroup>',
						'</matrix>'
					].join(''), 'text/xml').documentElement
				}
			),
			'deep equal'
		);
	});

	it('can serialize a calsTable in a basic n by n GridModel to an actual cals table', () => {
		// Create a new four-by-four table
		const tableGridModel = createTable(3, 4, true, documentNode);

		const success = tableGridModelToCalsTable(calsTableStructure, tableGridModel, tgroupNode, blueprint, stubFormat);
		chai.assert.isTrue(success, 'success');

		blueprint.realize();
		chai.assert.deepEqual(jsonMLMapper.serialize(documentNode.firstChild),
			['table',
				{ frame: 'all' },
				['tgroup',
					{ cols: '4' },
					['colspec', { colname: 'column-0', colnum: '1', colwidth: '1*', colsep: '1', rowsep: '1' }],
					['colspec', { colname: 'column-1', colnum: '2', colwidth: '1*', colsep: '1', rowsep: '1' }],
					['colspec', { colname: 'column-2', colnum: '3', colwidth: '1*', colsep: '1', rowsep: '1' }],
					['colspec', { colname: 'column-3', colnum: '4', colwidth: '1*', colsep: '1', rowsep: '1' }],
					['thead',
						['row',
							['entry', { colname: 'column-0', colsep: '1', rowsep: '1' }],
							['entry', { colname: 'column-1', colsep: '1', rowsep: '1' }],
							['entry', { colname: 'column-2', colsep: '1', rowsep: '1' }],
							['entry', { colname: 'column-3', colsep: '1', rowsep: '1' }]
						]
					],
					['tbody',
						['row',
							['entry', { colname: 'column-0', colsep: '1', rowsep: '1' }],
							['entry', { colname: 'column-1', colsep: '1', rowsep: '1' }],
							['entry', { colname: 'column-2', colsep: '1', rowsep: '1' }],
							['entry', { colname: 'column-3', colsep: '1', rowsep: '1' }]
						],
						['row',
							['entry', { colname: 'column-0', colsep: '1', rowsep: '1' }],
							['entry', { colname: 'column-1', colsep: '1', rowsep: '1' }],
							['entry', { colname: 'column-2', colsep: '1', rowsep: '1' }],
							['entry', { colname: 'column-3', colsep: '1', rowsep: '1' }]
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

		const success = tableGridModelToCalsTable(calsTableStructure, tableGridModel, tgroupNode, blueprint, stubFormat);
		chai.assert.isTrue(success, 'success');

		blueprint.realize();
		chai.assert.deepEqual(jsonMLMapper.serialize(documentNode.firstChild),
			['table',
				{ frame: 'all' },
				['tgroup',
					{ cols: '4' },
					['colspec', { colname: 'column-0', colnum: '1', colwidth: '1*', colsep: '1', rowsep: '1' }],
					['colspec', { colname: 'column-1', colnum: '2', colwidth: '1*', colsep: '1', rowsep: '1' }],
					['colspec', { colname: 'column-2', colnum: '3', colwidth: '1*', colsep: '1', rowsep: '1' }],
					['colspec', { colname: 'column-3', colnum: '4', colwidth: '1*', colsep: '1', rowsep: '1' }],
					['thead',
						['row',
							['entry', { colname: 'column-0', colsep: '1', rowsep: '1' }],
							['entry', { colname: 'column-1', colsep: '1', rowsep: '1' }],
							['entry', { colname: 'column-2', colsep: '1', rowsep: '1' }],
							['entry', { colname: 'column-3', colsep: '1', rowsep: '1' }]
						]
					],
					['tbody',
						['row',
							['entry', { colname: 'column-0', colsep: '1', rowsep: '1' }],
							['entry', { namest: 'column-1', colsep: '1', rowsep: '1', nameend: 'column-2', morerows: '1' }],
							['entry', { colname: 'column-3', colsep: '1', rowsep: '1' }]
						],
						['row',
							['entry', { colname: 'column-0', colsep: '1', rowsep: '1' }],
							['entry', { colname: 'column-3', colsep: '1', rowsep: '1' }]
						]
					]
				]
			]);
	});
});
