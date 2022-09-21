import './utils/installOperationStubs';

import * as slimdom from 'slimdom';

import Blueprint from 'fontoxml-blueprints/src/Blueprint';
import CoreDocument from 'fontoxml-core/src/Document';
import DocumentController from 'fontoxml-core/src/DocumentController';
import documentsManager from 'fontoxml-documents/src/documentsManager';
import type { DocumentId } from 'fontoxml-documents/src/types';
import jsonMLMapper from 'fontoxml-dom-utils/src/jsonMLMapper';
import type { FontoDocumentNode } from 'fontoxml-dom-utils/src/types';
import DocumentFile from 'fontoxml-remote-documents/src/DocumentFile';
import SchemaExperience from 'fontoxml-schema-experience/src/SchemaExperience';
import cellSelectionManager from 'fontoxml-table-flow/src/cellSelectionManager';
import tableDefinitionManager from 'fontoxml-table-flow/src/tableDefinitionManager';
import type TableCell from 'fontoxml-table-flow/src/TableGridModel/TableCell';
import type TableGridModel from 'fontoxml-table-flow/src/TableGridModel/TableGridModel';
import CalsTableDefinition from 'fontoxml-table-flow-cals/src/table-definition/CalsTableDefinition';

describe('cellSelectionManager', () => {
	let documentNode: FontoDocumentNode<'writable'>;
	let coreDocument: CoreDocument;
	let blueprint: Blueprint | null;
	let tableDefinition;
	let documentId: DocumentId;

	beforeEach(() => {
		documentNode = new slimdom.Document() as FontoDocumentNode<'writable'>;
		coreDocument = new CoreDocument(
			documentNode,
			new SchemaExperience([], [])
		);
		blueprint = null;
		documentId = documentsManager.addDocument(
			new DocumentFile(
				'abc',
				{},
				{ isLockAvailable: true, isLockAcquired: false, reason: 'n/a' },
				'abc'
			),
			new DocumentController(coreDocument)
		);

		tableDefinition = new CalsTableDefinition({
			table: {
				localName: 'table',
			},
		});
		tableDefinitionManager.addTableDefinition(tableDefinition);
	});

	afterEach(() => {
		if (blueprint) {
			blueprint.destroy();
		}
		documentsManager.removeDocument(documentId);
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
