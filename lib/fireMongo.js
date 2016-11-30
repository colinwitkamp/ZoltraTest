const mongoose = require('mongoose');
const Hashes = require('jshashes');
const SHA1 = new Hashes.SHA1();
module.exports = function(str) {
  var hex = SHA1.hex(str);
  return hex.substring(2, 14);
};