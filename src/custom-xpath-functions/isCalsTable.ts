import type { DocumentedXPathFunction } from 'fontoxml-documentation-helpers/src/types';
import type { FontoNode } from 'fontoxml-dom-utils/src/types';
import type { XQDynamicContext } from 'fontoxml-selectors/src/types';
import isTableNodeInstanceOfTableDefinition from 'fontoxml-table-flow/src/isTableNodeInstanceOfTableDefinition';

import CalsTableDefinition from '../table-definition/CalsTableDefinition';

/**
 * @remarks
 * Returns whether the given node is a cals table node. This will return true for
 * both table figure node (table) and table defining node (tgroup). If null or
 * nothing is passed, the function will return false.
 *
 * @fontosdk
 *
 * @param node - The node to check
 *
 * @returns The result of the test as an xs:boolean
 */
const fn: DocumentedXPathFunction<
	{
		namespaceURI: 'http://www.fontoxml.com/functions';
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
