import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { buildTest } from './template.mjs';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

buildTest('QW-BP10', resolve(__dirname, '../fixtures/testcases/BP10/testcases.json'));
