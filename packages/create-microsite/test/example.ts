import { suite } from 'uvu';
import * as assert from 'uvu/assert';

const a = suite('a');

a('a test', () => {
  assert.is(1, 1);
});

a.run();
