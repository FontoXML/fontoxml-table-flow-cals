import configureAsTableElements from 'fontoxml-table-flow/src/configureAsTableElements.js';
import CalsTableDefinition from './table-definition/CalsTableDefinition.js';

/**
 * Configure the cals table implementation
 *
 * @fontosdk
 *
 * @category add-on/fontoxml-table-flow-cals
 *
 * @param  {Object}   sxModule
 * @param  {Object}   options
 * @param  {number}   [options.priority]                    Selector priority for all elements configured by this function
 * @param  {Object}   [options.yesOrNo]                     Defines the true and false values for attributes like colsep
 * @param  {string}   [options.yesOrNo.yesValue='1']        The true value
 * @param  {string}   [options.yesOrNo.noValue='0']         The false value
 * @param  {Object}   options.table                         Configuration options for the table element
 * @param  {string}   options.table.localName               The local name of the table element
 * @param  {string}   [options.table.namespaceURI]          The namespace URI unique to the table element
 * @param  {Object}   [options.tgroup]                      Configuration options for the tgroup element
 * @param  {string}   [options.tgroup.namespaceURI]         The namespace URI for the tgroup element and its child elements
 * @param  {string}   [options.tgroup.tableFigureFilterSelector]  An optional selector which is used to filter which possible tables should be seen as cals tables for this configuration.
 * @param  {Object}   [options.entry]                       Configuration options for the entry element
 * @param  {string}   [options.entry.defaultTextContainer]  The default text container for the entry element
 * @param  {Object}   [options.thead]                       Configuration options for the thead element
 * @param  {string}   [options.thead.localName='thead']     The local name for the thead element
 * @param  {Object}   [options.tfoot]                       Configuration options for the tfoor element
 * @param  {string}   [options.tfoot.localName='tfoot']     The local name for the tfoor element
 */
export default function configureAsCalsTableElements(sxModule, options) {
	options = options || {};
	options['cell'] = {
		defaultTextContainer:
			options.entry && options.entry.defaultTextContainer
				? options.entry.defaultTextContainer
				: null
	};
	var tableDefinition = new CalsTableDefinition(options);
	configureAsTableElements(sxModule, options, tableDefinition);
}
