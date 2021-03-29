const path = require('path');

module.exports = {
  entry: './prebuild/index.js',
  output: {
    filename: 'qw-page.bundle.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      name: 'Module',
      type: 'this'
    }
  },
  target: 'web'
}