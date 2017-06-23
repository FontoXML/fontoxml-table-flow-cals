import blueprints from 'fontoxml-blueprints';
import getNodeId from 'fontoxml-dom-identification/getNodeId';
import core from 'fontoxml-core';
import jsonMLMapper from 'fontoxml-dom-utils/jsonMLMapper';
import * as slimdom from 'slimdom';

import registerCustomXPathFunction from 'fontoxml-selectors/registerCustomXPathFunction';

import evaluateXPathToNodes from 'fontoxml-selectors/evaluateXPathToNodes';
import tableFlow from 'fontoxml-table-flow';
import buildGridModel from 'fontoxml-table-flow-cals/tableStructure/buildGridModel';
import CalsTableStructure from 'fontoxml-table-flow-cals/tableStructure/CalsTableStructure';
import tableStructureManager from 'fontoxml-table-flow/TableStructureManager';
import toggleCellBorder from 'fontoxml-table-flow-cals/commands/primitives/toggleCellBorder';

const Blueprint = blueprints.Blueprint;
const CoreDocument = core.Document;

const tableGridModelLookup = tableFlow.tableGridModelLookupSingleton;

const singleCellTable = ['table',
		['tgroup',
			{ cols: '1' },
			['tbody',
				['row',
					['entry']
				]
			]
		]
	];

const multiCellTable = ['table',
	{ frame: 'all' },
	['tgroup',
		{ cols: '3' },
		['colspec', { colname: 'column-0', colnum: '1', colwidth: '1*', colsep: '0', rowsep: '1' }],
		['colspec', { colname: 'column-1', colnum: '2', colwidth: '1*', colsep: '0', rowsep: '1' }],
		['colspec', { colname: 'column-2', colnum: '3', colwidth: '1*', colsep: '0', rowsep: '1' }],
		['tbody',
			['row',
				['entry', { colsep: '0', rowsep: '0', colname: 'column-0' }],
				['entry', { colsep: '0', rowsep: '0', colname: 'column-1' }],
				['entry', { colsep: '0', rowsep: '0', colname: 'column-2' }]
			],
			['row',
				['entry', { colsep: '0', rowsep: '0', colname: 'column-0' }],
				['entry', { colsep: '0', rowsep: '0', namest: 'column-1', nameend: 'column-2', morerows: '1' }]
			],
			['row',
				['entry', { colsep: '0', rowsep: '0', colname: 'column-0' }]
			]
		]
	]
];

const stubFormat = {
		synthesizer: {
			completeStructure: () => true
		},
		validator: {
			validateDown: () => []
		}
	};

describe('toggleCellBorderCommand', () => {
	let documentNode,
		coreDocument,
		blueprint,
		calsTableStructure;


	registerCustomXPathFunction('fonto:is-table', ['node()'], 'xs:boolean', function (_dynamicContext, node) {
		return tableStructureManager.getTableStructures().some(function (tableStructure) {
			return tableStructure.isTable(node);
		});
	});

	beforeEach(() => {
		documentNode = new slimdom.Document();
		coreDocument = new CoreDocument(documentNode);

		blueprint = new Blueprint(coreDocument.dom);
		calsTableStructure = new CalsTableStructure({
			table: {
				localName: 'table',
				namespaceUri: ''
			},
			tgroup: {
				namespaceUri: ''
			}
		});
		tableStructureManager.addTableStructure(calsTableStructure);
	});

	it('is enabled and not active when no border will be changed', () => {
		coreDocument.dom.mutate(() => jsonMLMapper.parse(singleCellTable, documentNode));

		const tableElement = documentNode.firstChild;
		const tgroupElement = tableElement.firstChild;

		tableGridModelLookup.addToLookup(tgroupElement, buildGridModel(calsTableStructure, tgroupElement, blueprint));
		const resultingState = {};
		const success = toggleCellBorder(
				blueprint,
				stubFormat,
				resultingState,
				evaluateXPathToNodes('//entry', tgroupElement, blueprint).map(getNodeId),
				undefined,
				undefined,
				undefined,
				undefined,
				false);

		chai.assert.isTrue(success);
		chai.assert.isTrue(!!resultingState.active);

		blueprint.realize();
		chai.assert.deepEqual(jsonMLMapper.serialize(tableElement), singleCellTable);
	});

	it('is enabled and not active when border will be changed', () => {
		coreDocument.dom.mutate(() => jsonMLMapper.parse(multiCellTable, documentNode));

		const tableElement = documentNode.firstChild;
		const tgroupElement = tableElement.firstChild;

		tableGridModelLookup.addToLookup(tgroupElement, buildGridModel(calsTableStructure, tgroupElement, blueprint));
		const resultingState = {};
		const success = toggleCellBorder(
			blueprint,
			stubFormat,
			resultingState,
			evaluateXPathToNodes('//row[2]//entry[2]', tgroupElement, blueprint).map(getNodeId),
			true,
			true,
			true,
			true,
			false);

		chai.assert.isTrue(success);
		chai.assert.isFalse(!!resultingState.active);

		blueprint.realize();
		chai.assert.deepEqual(jsonMLMapper.serialize(tableElement),
			['table',
				{ frame: 'all' },
				['tgroup',
					{ cols: '3' },
					// colsep is set to '1' by table grid model, even though it is always overwritten on entry level
					['colspec', { colname: 'column-0', colnum: '1', colwidth: '1*', colsep: '0', rowsep: '1' }],
					// colsep is set to '1' by table grid model, even though it is always overwritten on entry level
					['colspec', { colname: 'column-1', colnum: '2', colwidth: '1*', colsep: '0', rowsep: '1' }],
					// colsep is set to '1' by table grid model, even though it is always overwritten on entry level
					['colspec', { colname: 'column-2', colnum: '3', colwidth: '1*', colsep: '0', rowsep: '1' }],
					['tbody',
						['row',
							['entry', { colsep: '0', rowsep: '0', colname: 'column-0' }],
							['entry', { colsep: '0', rowsep: '1', colname: 'column-1' }],
							['entry', { colsep: '0', rowsep: '1', colname: 'column-2' }]
						],
						['row',
							['entry', { colsep: '1', rowsep: '0', colname: 'column-0' }],
							['entry', { colsep: '1', rowsep: '1', namest: 'column-1', nameend: 'column-2', morerows: '1' }]
						],
						['row',
							['entry', { colsep: '1', rowsep: '0', colname: 'column-0' }]
						]
					]
				]
			]);
	});

	it('is enabled and not active when border will be changed (with yes and no as boolean values)', () => {
		coreDocument.dom.mutate(() => jsonMLMapper.parse(['table-figure',
				{ frame: 'all' },
				['tgroup',
					{ cols: '3' },
					['colspec', { colname: 'column-0', colnum: '1', colwidth: '1*', colsep: 'no', rowsep: 'yes' }],
					['colspec', { colname: 'column-1', colnum: '2', colwidth: '1*', colsep: 'no', rowsep: 'yes' }],
					['colspec', { colname: 'column-2', colnum: '3', colwidth: '1*', colsep: 'no', rowsep: 'yes' }],
					['tbody',
						['row',
							['entry', { colsep: 'no', rowsep: 'no', colname: 'column-0' }],
							['entry', { colsep: 'no', rowsep: 'no', colname: 'column-1' }],
							['entry', { colsep: 'no', rowsep: 'no', colname: 'column-2' }]
						],
						['row',
							['entry', { colsep: 'no', rowsep: 'no', colname: 'column-0' }],
							['entry', { colsep: 'no', rowsep: 'no', namest: 'column-1', nameend: 'column-2', morerows: '1' }]
						],
						['row',
							['entry', { colsep: 'no', rowsep: 'no', colname: 'column-0' }]
						]
					]
				]
			], documentNode));

		const tableElement = documentNode.firstChild;
		const tgroupElement = tableElement.firstChild;

		const otherCalsTableStructure = new CalsTableStructure({
			yesOrNo: {
				yesValue: 'yes',
				noValue: 'no'
			},
			table: {
				localName: 'table-figure',
				namespaceUri: ''
			},
			tgroup: {
				namespaceUri: ''
			}
		});
		tableStructureManager.addTableStructure(otherCalsTableStructure);

		tableGridModelLookup.addToLookup(tableElement, buildGridModel(otherCalsTableStructure, tgroupElement, blueprint));
		const resultingState = {};
		const success = toggleCellBorder(
			blueprint,
			stubFormat,
			resultingState,
			evaluateXPathToNodes('//row[2]//entry[2]', tgroupElement, blueprint).map(getNodeId),
			true,
			true,
			true,
			true,
			false);

		chai.assert.isTrue(success);
		chai.assert.isFalse(!!resultingState.active);

		blueprint.realize();
		chai.assert.deepEqual(jsonMLMapper.serialize(tableElement),
			['table-figure',
				{ frame: 'all' },
				['tgroup',
					{ cols: '3' },
					// colsep is set to '1' by table grid model, even though it is always overwritten on entry level
					['colspec', { colname: 'column-0', colnum: '1', colwidth: '1*', colsep: 'no', rowsep: 'yes' }],
					// colsep is set to '1' by table grid model, even though it is always overwritten on entry level
					['colspec', { colname: 'column-1', colnum: '2', colwidth: '1*', colsep: 'no', rowsep: 'yes' }],
					// colsep is set to '1' by table grid model, even though it is always overwritten on entry level
					['colspec', { colname: 'column-2', colnum: '3', colwidth: '1*', colsep: 'no', rowsep: 'yes' }],
					['tbody',
						['row',
							['entry', { colsep: 'no', rowsep: 'no', colname: 'column-0' }],
							['entry', { colsep: 'no', rowsep: 'yes', colname: 'column-1' }],
							['entry', { colsep: 'no', rowsep: 'yes', colname: 'column-2' }]
						],
						['row',
							['entry', { colsep: 'yes', rowsep: 'no', colname: 'column-0' }],
							['entry', { colsep: 'yes', rowsep: 'yes', namest: 'column-1', nameend: 'column-2', morerows: '1' }]
						],
						['row',
							['entry', { colsep: 'yes', rowsep: 'no', colname: 'column-0' }]
						]
					]
				]
			]);
	});

	it('is enabled and not active when top- and bottom border will be changed', () => {
		coreDocument.dom.mutate(() => jsonMLMapper.parse(multiCellTable, documentNode));

		const tableElement = documentNode.firstChild;
		const tgroupElement = tableElement.firstChild;

		tableGridModelLookup.addToLookup(tableElement, buildGridModel(calsTableStructure, tgroupElement, blueprint));
		const resultingState = {};
		const success = toggleCellBorder(
			blueprint,
			stubFormat,
			resultingState,
			evaluateXPathToNodes('//row[2]//entry[2]', tgroupElement, blueprint).map(getNodeId),
			true,
			true,
			false,
			false,
			false);

		chai.assert.isTrue(success);
		chai.assert.isFalse(!!resultingState.active);

		blueprint.realize();
		chai.assert.deepEqual(jsonMLMapper.serialize(tableElement),
			['table',
				{ frame: 'all' },
				['tgroup',
					{ cols: '3' },
					// colsep is set to '1' by table grid model, even though it is always overwritten on entry level
					['colspec', { colname: 'column-0', colnum: '1', colwidth: '1*', colsep: '0', rowsep: '1' }],
					// colsep is set to '1' by table grid model, even though it is always overwritten on entry level
					['colspec', { colname: 'column-1', colnum: '2', colwidth: '1*', colsep: '0', rowsep: '1' }],
					// colsep is set to '1' by table grid model, even though it is always overwritten on entry level
					['colspec', { colname: 'column-2', colnum: '3', colwidth: '1*', colsep: '0', rowsep: '1' }],
					['tbody',
						['row',
							['entry', { colsep: '0', rowsep: '0', colname: 'column-0' }],
							['entry', { colsep: '0', rowsep: '1', colname: 'column-1' }],
							['entry', { colsep: '0', rowsep: '1', colname: 'column-2' }]
						],
						['row',
							['entry', { colsep: '0', rowsep: '0', colname: 'column-0' }],
							['entry', { colsep: '0', rowsep: '1', namest: 'column-1', nameend: 'column-2', morerows: '1' }]
						],
						['row',
							['entry', { colsep: '0', rowsep: '0', colname: 'column-0' }]
						]
					]
				]
			]);
	});

	it('is enabled and not active when left- and right bottom border will be changed', () => {
		coreDocument.dom.mutate(() => jsonMLMapper.parse(multiCellTable, documentNode));

		const tableElement = documentNode.firstChild;
		const tgroupElement = tableElement.firstChild;

		tableGridModelLookup.addToLookup(tgroupElement, buildGridModel(calsTableStructure, tgroupElement, blueprint));
		const resultingState = {};
		const success = toggleCellBorder(
			blueprint,
			stubFormat,
			resultingState,
			evaluateXPathToNodes('//row[2]//entry[2]', tgroupElement, blueprint).map(getNodeId),
			false,
			false,
			true,
			true,
			false);

		chai.assert.isTrue(success);
		chai.assert.isFalse(!!resultingState.active);

		blueprint.realize();
		chai.assert.deepEqual(jsonMLMapper.serialize(tableElement),
			['table',
				{ frame: 'all' },
				['tgroup',
					{ cols: '3' },
					// colsep is set to '1' by table grid model, even though it is always overwritten on entry level
					['colspec', { colname: 'column-0', colnum: '1', colwidth: '1*', colsep: '0', rowsep: '1' }],
					// colsep is set to '1' by table grid model, even though it is always overwritten on entry level
					['colspec', { colname: 'column-1', colnum: '2', colwidth: '1*', colsep: '0', rowsep: '1' }],
					// colsep is set to '1' by table grid model, even though it is always overwritten on entry level
					['colspec', { colname: 'column-2', colnum: '3', colwidth: '1*', colsep: '0', rowsep: '1' }],
					['tbody',
						['row',
							['entry', { colsep: '0', rowsep: '0', colname: 'column-0' }],
							['entry', { colsep: '0', rowsep: '0', colname: 'column-1' }],
							['entry', { colsep: '0', rowsep: '0', colname: 'column-2' }]
						],
						['row',
							['entry', { colsep: '1', rowsep: '0', colname: 'column-0' }],
							['entry', { colsep: '1', rowsep: '0', namest: 'column-1', nameend: 'column-2', morerows: '1' }]
						],
						['row',
							['entry', { colsep: '1', rowsep: '0', colname: 'column-0' }]
						]
					]
				]
			]);
	});

	it('is enabled and active when nothing is changed', () => {
		coreDocument.dom.mutate(() => jsonMLMapper.parse(multiCellTable, documentNode));

		const tableElement = documentNode.firstChild;
		const tgroupElement = tableElement.firstChild;

		tableGridModelLookup.addToLookup(tgroupElement, buildGridModel(calsTableStructure, tgroupElement, blueprint));
		const resultingState = {};
		const success = toggleCellBorder(
			blueprint,
			stubFormat,
			resultingState,
			evaluateXPathToNodes('//row[2]//entry[2]', tgroupElement, blueprint).map(getNodeId),
			false,
			false,
			false,
			false,
			false);

		chai.assert.isTrue(success);
		chai.assert.isTrue(!!resultingState.active);

		blueprint.realize();
		chai.assert.deepEqual(jsonMLMapper.serialize(tableElement),
			['table',
				{ frame: 'all' },
				['tgroup',
					{ cols: '3' },
					// colsep is set to '1' by table grid model, even though it is always overwritten on entry level
					['colspec', { colname: 'column-0', colnum: '1', colwidth: '1*', colsep: '0', rowsep: '1' }],
					// colsep is set to '1' by table grid model, even though it is always overwritten on entry level
					['colspec', { colname: 'column-1', colnum: '2', colwidth: '1*', colsep: '0', rowsep: '1' }],
					// colsep is set to '1' by table grid model, even though it is always overwritten on entry level
					['colspec', { colname: 'column-2', colnum: '3', colwidth: '1*', colsep: '0', rowsep: '1' }],
					['tbody',
						['row',
							['entry', { colsep: '0', rowsep: '0', colname: 'column-0' }],
							['entry', { colsep: '0', rowsep: '1', colname: 'column-1' }],
							['entry', { colsep: '0', rowsep: '1', colname: 'column-2' }]
						],
						['row',
							['entry', { colsep: '1', rowsep: '0', colname: 'column-0' }],
							['entry', { colsep: '1', rowsep: '1', namest: 'column-1', nameend: 'column-2', morerows: '1' }]
						],
						['row',
							['entry', { colsep: '1', rowsep: '0', colname: 'column-0' }]
						]
					]
				]
			]);
	});
});
