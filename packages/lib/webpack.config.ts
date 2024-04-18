import { resolve } from 'path';

export const mode = 'production';
export const entry = './prebuild/index.js';
export const output = {
  filename: 'lib.bundle.js',
  path: resolve(__dirname, 'dist'),
  library: {
    type: 'this'
  }
};
export const target = 'web';