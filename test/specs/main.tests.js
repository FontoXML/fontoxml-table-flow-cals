define(
	[
		'fontoxml-base-flow'
	],
	function (
		baseFlow
		) {
		'use strict';

		describe('FontoXML/base-flow', function () {
			it('can be loaded', function () {
			});

			it('exposes BlueprintedCommand from core', function() {
				chai.expect(baseFlow).to.respond.to('BlueprintedCommand');
			});
		});
	}
);
