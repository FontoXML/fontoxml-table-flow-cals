import './utils/installOperationStubs';

import readOnlyBlueprint from 'fontoxml-blueprints/src/readOnlyBlueprint';
import type { DocumentId } from 'fontoxml-documents/src/types';
import cellSelectionManager from 'fontoxml-table-flow/src/cellSelectionManager';
import tableDefinitionManager from 'fontoxml-table-flow/src/tableDefinitionManager';
import type TableCell from 'fontoxml-table-flow/src/TableGridModel/TableCell';
import type TableGridModel from 'fontoxml-table-flow/src/TableGridModel/TableGridModel';
import CalsTableDefinition from 'fontoxml-table-flow-cals/src/table-definition/CalsTableDefinition';
import UnitTestEnvironment from 'fontoxml-unit-test-utils/src/UnitTestEnvironment';
import { findFirstNodeInDocument } from 'fontoxml-unit-test-utils/src/unitTestSetupHelpers';

describe('cellSelectionManager', () => {
	let tableDefinition;
	let documentId: DocumentId;

	let environment: UnitTestEnvironment;

	beforeEach(() => {
		environment = new UnitTestEnvironment();
		environment.stubXPathFunction(
			{
				namespaceURI: 'http://www.fontoxml.com/functions',
				localName: 'direction',
			},
			['node()?'],
			'xs:string',
			(_dynamicContext) => {
				return 'ltr';
			}
		);

		tableDefinition = new CalsTableDefinition({
			table: {
				localName: 'table',
			},
		});
		tableDefinitionManager.addTableDefinition(tableDefinition);
	});

	afterEach(() => {
		environment.destroy();
		tableDefinitionManager.removeTableDefinition(tableDefinition);
	});

	function getTableGridModel(jsonIn): TableGridModel {
		documentId = environment.createDocumentFromJsonMl(jsonIn);

		const tableNode = findFirstNodeInDocument(
			documentId,
			'descendant::tgroup[1]'
		);
		const gridModel = tableDefinition.buildTableGridModel(
			tableNode,
			readOnlyBlueprint
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
				findFirstNodeInDocument(documentId, 'descendant::tbody')
			);
		});
	});
});
