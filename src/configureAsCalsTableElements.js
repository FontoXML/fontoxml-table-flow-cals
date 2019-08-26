import configureAsTableElements from 'fontoxml-table-flow/src/configureAsTableElements.js';
import CalsTableDefinition from './table-definition/CalsTableDefinition.js';

/**
 * Configure the cals table implementation
 *
 * Example usage for the table widgets:
 *
 *```
 * 	configureAsCalsTableElements(sxModule, {
 * 		table: {
 *			localName: 'table'
 *		},
 *		entry: {
 *			defaultTextContainer: 'p'
 *		},
 *		columnBefore: [createIconWidget('clock-o', {
 *			clickOperation: 'lcTime-value-edit',
 *			tooltipContent: 'Click here to edit the duration'
 *		})],
 *		rowBefore: [
 *				createIconWidget('dot-circle-o', {
 *					clickOperation: 'do-nothing'
 *				})
 *			],
 *		showInsertionWidget: true,
 *		showHighlightingWidget: true
 *	});
 *```
 *
 * @fontosdk
 *
 * @category add-on/fontoxml-table-flow-cals
 *
 * @param  {Object}          sxModule
 * @param  {Object}          options
 * @param  {number}          [options.priority]                          Selector priority for all elements configured by this function
 * @param  {boolean}         [options.showInsertionWidget]               To add insertion buttons which insert a column or a row to a specific place, default false.
 * @param  {boolean}         [options.showHighlightingWidget]            To add highlighting bars which highlight columns and rows, and provide operations popover, default false.
 * @param  {Widget[]|null}   [options.columnBefore]                      To add column icon widgets by using {@link createIconWidget}. Any widget can be added but only icon widget is supported.
 * @param  {Widget[]|null}   [options.rowBefore]                         To add row icon widgets by using {@link createIconWidget}. Any widget can be added but only icon widget is supported.
 * @param  {Object}          [options.yesOrNo]                           Defines the true and false values for attributes like colsep
 * @param  {string}          [options.yesOrNo.yesValue='1']              The true value
 * @param  {string}          [options.yesOrNo.noValue='0']               The false value
 * @param  {Object}          options.table                               Configuration options for the table element
 * @param  {string}          options.table.localName                     The local name of the table element
 * @param  {string}          [options.table.namespaceURI]                The namespace URI unique to the table element
 * @param  {Object}          [options.tgroup]                            Configuration options for the tgroup element
 * @param  {string}          [options.tgroup.namespaceURI]               The namespace URI for the tgroup element and its child elements
 * @param  {string}          [options.tgroup.tableFigureFilterSelector]  An optional selector which is used to filter which possible tables should be seen as cals tables for this configuration.
 * @param  {Object}          [options.entry]                             Configuration options for the entry element
 * @param  {string}          [options.entry.defaultTextContainer]        The default text container for the entry element
 * @param  {Object}          [options.thead]                             Configuration options for the thead element
 * @param  {string}          [options.thead.localName='thead']           The local name for the thead element
 * @param  {Object}          [options.tfoot]                             Configuration options for the tfoot element
 * @param  {string}          [options.tfoot.localName='tfoot']           The local name for the tfoot element
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
