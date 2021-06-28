import install from 'fontoxml-table-flow-cals/src/install';

let isRegistered = false;

export default function registerCustomXPathFunctions() {
	if (isRegistered) {
		return;
	}

	isRegistered = true;

	install();
}
