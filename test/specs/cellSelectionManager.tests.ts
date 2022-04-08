import * as slimdom from 'slimdom';

import Blueprint from 'fontoxml-blueprints/src/Blueprint';
import DocumentFile from 'fontoxml-connector/src/DocumentFile';
import CoreDocument from 'fontoxml-core/src/Document';
import DocumentController from 'fontoxml-core/src/DocumentController';
import documentsManager from 'fontoxml-documents/src/documentsManager';
import jsonMLMapper from 'fontoxml-dom-utils/src/jsonMLMapper';
import type {
	FontoDocumentNode,
	FontoRange,
} from 'fontoxml-dom-utils/src/types';
import SchemaExperience from 'fontoxml-schema-experience/src/SchemaExperience';
import cellSelectionManager from 'fontoxml-table-flow/src/cellSelectionManager';
import tableDefinitionManager from 'fontoxml-table-flow/src/tableDefinitionManager';
import type TableCell from 'fontoxml-table-flow/src/TableGridModel/TableCell';
import type TableGridModel from 'fontoxml-table-flow/src/TableGridModel/TableGridModel';
import CalsTableDefinition from 'fontoxml-table-flow-cals/src/table-definition/CalsTableDefinition';

import _installOperationStubs from './utils/installOperationStubs';

describe('cellSelectionManager', () => {
	let documentNode: FontoDocumentNode<'writable'>;
	let coreDocument: CoreDocument;
	let blueprint: Blueprint | null;
	let selectionRange: FontoRange<'readable'>;
	let tableDefinition;

	beforeEach(async () => {
		documentNode = new slimdom.Document() as FontoDocumentNode<'writable'>;
		coreDocument = new CoreDocument(
			documentNode,
			new SchemaExperience([], [])
		);
		blueprint = null;
		await documentsManager.addDocument(
			new DocumentFile(
				'abc',
				{},
				{ isLockAvailable: true, isLockAcquired: false, reason: 'n/a' },
				'abc'
			),
			new DocumentController(coreDocument)
		);

		selectionRange = documentNode.createRange();

		tableDefinition = new CalsTableDefinition({
			table: {
				localName: 'table',
			},
		});
		tableDefinitionManager.addTableDefinition(tableDefinition);
	});

	afterEach(() => {
		coreDocument.destroy();
		if (blueprint) {
			blueprint.destroy();
		}
		tableDefinitionManager.removeTableDefinition(tableDefinition);
	});

	function getTableGridModel(jsonIn): TableGridModel {
		coreDocument.dom.mutate(() => jsonMLMapper.parse(jsonIn, documentNode));
		blueprint = new Blueprint(coreDocument.dom);

		const tableNode = documentNode.firstChild.firstChild;
		const gridModel = tableDefinition.buildTableGridModel(
			tableNode,
			blueprint
		);
		chai.assert.isUndefined(gridModel.error);
		return gridModel;
	}

	describe('getCommonAncestor', () => {
		it('returns a container node (e.g. thead tbody), if the common ancestor of the selected cells is that container node', async () => {
			const jsonIn = [
				'table',
				[
					'tgroup',
					{ cols: '2' },

					['colspec'],
					['colspec'],
					[
						'tbody',
						['row', ['entry'], ['entry']],
						['row', ['entry'], ['entry']],
						['row', ['entry'], ['entry']],
						['row', ['entry'], ['entry']],
					],
				],
			];

			const tableGridModel = getTableGridModel(jsonIn);
			const firstCell = tableGridModel.getCellAtCoordinates(
				0,
				0
			) as TableCell;
			const secondCell = tableGridModel.getCellAtCoordinates(
				1,
				1
			) as TableCell;

			await cellSelectionManager.setCellCombination(
				firstCell.element,
				secondCell.element
			);

			chai.assert.equal(
				cellSelectionManager.getCommonAncestor(),
				// tbody
				documentNode.firstChild.firstChild.lastChild
			);
		});
	});
});
