const mongoose = require('mongoose');
const Hashes = require('jshashes');
const SHA1 = new Hashes.SHA1();
module.exports = function(str) {
  var hex = SHA1.hex(str);
  console.log(hex);
  return hex.substring(5, 17);
};