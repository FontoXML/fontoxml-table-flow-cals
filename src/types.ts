import type { DefaultTextContainer } from 'fontoxml-families/src/types';
import type { XPathTest, XQExpression } from 'fontoxml-selectors/src/types';

/**
 * @remarks
 * The options accepted by {@link configureAsCalsTableElements}. Please see
 * {@link TableElementsSharedOptions} for more information on the other
 * options accepted by this function.
 *
 * @fontosdk
 */
export type TableElementsCalsOptions = {
	/**
	 * @remarks
	 * Configuration options for the table which is the
	 * frame surrounding one or more CALS tables.
	 *
	 * @fontosdk
	 */
	table: {
		/**
		 * @remarks
		 * The local name of this element.
		 *
		 * @fontosdk
		 */
		localName: string;
		/**
		 * @remarks
		 * The namespace URI for this element.
		 *
		 * @fontosdk
		 */
		namespaceURI?: string | null;
	};
	/**
	 * @remarks
	 *
	 *
	 * @fontosdk
	 */
	tgroup?: {
		/**
		 * @remarks
		 * The local name of this element.
		 *
		 * @fontosdk
		 */
		localName?: string;
		/**
		 * @remarks
		 * The namespace URI for this element.
		 *
		 * @fontosdk
		 */
		namespaceURI?: string | null;
		/**
		 * @remarks
		 * An optional selector which is used to filter which
		 * possible tables should be seen as cals tables for
		 * this configuration.
		 *
		 * @fontosdk
		 */
		tableFigureFilterSelector?: XPathTest | XQExpression;
	};
	/**
	 * @remarks
	 * Configuration options for the colspec.
	 *
	 * @fontosdk
	 */
	colspec?: {
		/**
		 * @remarks
		 * The local name of this element.
		 *
		 * @fontosdk
		 */
		localName?: string;
		/**
		 * @remarks
		 * The namespace URI for this element.
		 *
		 * @fontosdk
		 */
		namespaceURI?: string | null;
	};
	/**
	 * @remarks
	 *  Configuration options for the thead which is the
	 * container element of header rows.
	 *
	 * @fontosdk
	 */
	thead?: {
		/**
		 * @remarks
		 * The local name of this element.
		 *
		 * @fontosdk
		 */
		localName?: string;
		/**
		 * @remarks
		 * The namespace URI for this element.
		 *
		 * @fontosdk
		 */
		namespaceURI?: string | null;
	};
	/**
	 * @remarks
	 * Configuration options for the tbody which is the
	 * container element of the normal rows.
	 *
	 * @fontosdk
	 */
	tbody?: {
		/**
		 * @remarks
		 * The local name of this element.
		 *
		 * @fontosdk
		 */
		localName?: string;
		/**
		 * @remarks
		 * The namespace URI for this element.
		 *
		 * @fontosdk
		 */
		namespaceURI?: string | null;
	};
	/**
	 * @remarks
	 * Configuration options for the row.
	 *
	 * @fontosdk
	 */
	row?: {
		/**
		 * @remarks
		 * The local name of this element.
		 *
		 * @fontosdk
		 */
		localName?: string;
		/**
		 * @remarks
		 * The namespace URI for this element.
		 *
		 * @fontosdk
		 */
		namespaceURI?: string | null;
	};
	/**
	 * @remarks
	 * Configuration options for the entry.
	 *
	 * @fontosdk
	 */
	entry?: {
		/**
		 * @remarks
		 * The local name of this element.
		 *
		 * @fontosdk
		 */
		localName?: string;
		/**
		 * @remarks
		 * The namespace URI for this element.
		 *
		 * @fontosdk
		 */
		namespaceURI?: string | null;
		/**
		 * @remarks
		 *
		 *
		 * @fontosdk
		 */
		defaultTextContainer?: DefaultTextContainer;
	};
	/**
	 * @remarks
	 * Configuration options for the frame attribute
	 *  which describes position of outer rulings.
	 *
	 * @fontosdk
	 */
	frame?: {
		/**
		 * @remarks
		 * The local name of this element.
		 *
		 * @fontosdk
		 */
		localName?: string;
		/**
		 * @remarks
		 *
		 *
		 * @fontosdk
		 */
		allValue?: string;
		/**
		 * @remarks
		 *
		 *
		 * @fontosdk
		 */
		noneValue?: string;
	};
	/**
	 * @remarks
	 * Configuration options for the cols attribute which
	 * shows number of columns in the tgroup.
	 *
	 * @fontosdk
	 */
	cols?: {
		/**
		 * @remarks
		 * The local name of this attribute.
		 *
		 * @fontosdk
		 */
		localName?: string;
	};
	/**
	 * @remarks
	 * Configuration options for the colname attribute
	 * which is the name of the column.
	 *
	 * @fontosdk
	 */
	colname?: {
		/**
		 * @remarks
		 * The local name of this attribute.
		 *
		 * @fontosdk
		 */
		localName?: string;
	};
	/**
	 * @remarks
	 * Configuration options for the colsep attribute
	 * which display the internal vertical column ruling
	 * at the right of the entry if other than that false
	 * value; if false value, do not display it.
	 *
	 * @fontosdk
	 */
	colnum?: {
		/**
		 * @remarks
		 * The local name of this attribute.
		 *
		 * @fontosdk
		 */
		localName?: string;
	};
	/**
	 * @remarks
	 * Configuration options for the colwidth attribute
	 * which determines the width of the column.
	 *
	 * @fontosdk
	 */
	colwidth?: {
		/**
		 * @remarks
		 * The local name of this attribute.
		 *
		 * @fontosdk
		 */
		localName?: string;
	};
	/**
	 * @remarks
	 * Configuration options for the colsep attribute
	 * which display the internal vertical column ruling
	 * at the right of the entry if other than that false
	 * value; if false value, do not display it.
	 *
	 * @fontosdk
	 */
	colsep?: {
		/**
		 * @remarks
		 * The local name of this attribute.
		 *
		 * @fontosdk
		 */
		localName?: string;
	};
	/**
	 * @remarks
	 * Configuration options for the rowsep attribute
	 * which display the internal horizontal row ruling
	 * at the bottom of the entry if other than that
	 * false value; if false value, do not display it.
	 *
	 * @fontosdk
	 */
	rowsep?: {
		/**
		 * @remarks
		 * The local name of this attribute.
		 *
		 * @fontosdk
		 */
		localName?: string;
	};
	/**
	 * @remarks
	 * Configuration options for the morerows attribute
	 * which is the number of additional rows in a
	 * vertical straddle.
	 *
	 * @fontosdk
	 */
	morerows?: {
		/**
		 * @remarks
		 * The local name of this attribute.
		 *
		 * @fontosdk
		 */
		localName?: string;
	};
	/**
	 * @remarks
	 * Configuration options for the namest attribute
	 * which is the name of leftmost column of span.
	 *
	 * @fontosdk
	 */
	namest?: {
		/**
		 * @remarks
		 * The local name of this attribute.
		 *
		 * @fontosdk
		 */
		localName?: string;
	};
	/**
	 * @remarks
	 * Configuration options for the nameend attribute
	 * which is the name of rightmost column of span.
	 *
	 * @fontosdk
	 */
	nameend?: {
		/**
		 * @remarks
		 * The local name of this attribute.
		 *
		 * @fontosdk
		 */
		localName?: string;
	};
	/**
	 * @remarks
	 * Configuration options for the align attribute
	 * which determines the text horizontal position
	 * within the entry.
	 *
	 * @fontosdk
	 */
	align?: {
		/**
		 * @remarks
		 * The local name of this attribute.
		 *
		 * @fontosdk
		 */
		localName?: string;
		/**
		 * @remarks
		 * The left alignment value.
		 *
		 * @fontosdk
		 */
		leftValue?: string;
		/**
		 * @remarks
		 * The right alignment value.
		 *
		 * @fontosdk
		 */
		rightValue?: string;
		/**
		 * @remarks
		 * The center alignment value.
		 *
		 * @fontosdk
		 */
		centerValue?: string;
		/**
		 * @remarks
		 *
		 *
		 * @fontosdk
		 */
		justifyValue?: string;
	};
	/**
	 * @remarks
	 * Configuration options for the valign attribute
	 * which determines the text vertical positioning
	 * within the entry.
	 *
	 * @fontosdk
	 */
	valign?: {
		/**
		 * @remarks
		 * The local name of this attribute.
		 *
		 * @fontosdk
		 */
		localName?: string;
		/**
		 * @remarks
		 * The top vertical alignment value.
		 *
		 * @fontosdk
		 */
		topValue?: string;
		/**
		 * @remarks
		 * The middle vertical alignment value.
		 *
		 * @fontosdk
		 */
		middleValue?: string;
		/**
		 * @remarks
		 * The bottom vertical alignment value.
		 *
		 * @fontosdk
		 */
		bottomValue?: string;
	};
	/**
	 * @remarks
	 * Defines the true and false values for attributes
	 * like colsep, rowsep.
	 *
	 * @fontosdk
	 */
	yesOrNo?: {
		/**
		 * @remarks
		 * The true value.
		 *
		 * @fontosdk
		 */
		yesValue?: string;
		/**
		 * @remarks
		 * The false value.
		 *
		 * @fontosdk
		 */
		noValue?: string;
	};
};
