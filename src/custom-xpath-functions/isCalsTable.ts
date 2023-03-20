import type { DocumentedXPathFunction } from 'fontoxml-documentation-helpers/src/types';
import type { FontoNode } from 'fontoxml-dom-utils/src/types';
import type { XQDynamicContext } from 'fontoxml-selectors/src/types';
import isTableNodeInstanceOfTableDefinition from 'fontoxml-table-flow/src/isTableNodeInstanceOfTableDefinition';

import CalsTableDefinition from '../table-definition/CalsTableDefinition';

/**
 * @remarks
 * Returns true for any CALS table element (tgroup) or any CALS table figure
 * element (table) and false for any other node or empty sequence.
 *
 * @fontosdk
 *
 * @param node - The node to check
 *
 * @returns True for any CALS table or table figure element, false otherwise.
 */
const fn: DocumentedXPathFunction<
	{
		/**
		 * @fontosdk
		 */
		namespaceURI: 'http://www.fontoxml.com/functions';
		/**
		 * @fontosdk
		 */
		localName: 'is-cals-table';
	},
	['node()?'],
	'xs:boolean'
> = [
	{
		namespaceURI: 'http://www.fontoxml.com/functions',
		localName: 'is-cals-table',
	},
	['node()?'],
	'xs:boolean',
	function (
		dynamicContext: XQDynamicContext,
		node: FontoNode<'readable'>
	): boolean {
		return (
			node &&
			isTableNodeInstanceOfTableDefinition(
				dynamicContext.domFacade,
				node,
				CalsTableDefinition
			)
		);
	},
];

export default fn;
