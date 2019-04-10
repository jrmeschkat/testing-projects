const path = require('path');

const resolve = function(filename) {
  return path.resolve(__dirname, '..', filename);
};

module.exports = {
  resolve
};
