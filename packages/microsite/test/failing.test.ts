import { test, suite } from 'uvu';
import * as assert from 'uvu/assert';

test('it should pass', () => {
  assert.is(true, true);
});

test.run();

const a = suite('a');

a('a test', () => {
  assert.is(1, 1);
});

a.run();

const b = suite('b');

b('a test', () => {
  assert.is(1, 12);
});

b.run();
