import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import * as ENV from './_fixtures/env';
import { Document } from '../src/document';


const component = suite('Component');
component.before(ENV.setup);
component.before.each(ENV.reset);

component('should render a basic HTML document', () => {
	const { container } = ENV.render(Document, {});

	assert.snapshot(
		container.innerHTML,
		`<html lang="en" dir="ltr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=5.0"><base href="/"></head><body><div id="__microsite"></div></body></html>`
	);
});

component.run();
