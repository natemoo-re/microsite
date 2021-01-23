import { suite } from 'uvu';
import * as assert from 'uvu/assert';

const b = suite('b');

b('a test', () => {
  assert.is(1, 1);
});

b.run();
