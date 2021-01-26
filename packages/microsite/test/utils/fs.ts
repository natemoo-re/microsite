import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { fileExists } from '../../src/utils/fs';

import { resolve } from 'path';


const exists = suite('fileExists');

exists('should be a function', () => {
	assert.type(fileExists, 'function');
});

exists('should return true', async () => {
  assert.is(await fileExists(resolve(__dirname, '../../package.json')), true);
});

exists.run();
