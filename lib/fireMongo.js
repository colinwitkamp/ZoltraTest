const mongoose = require('mongoose');
const Hashes = require('jshashes');
const SHA1 = new Hashes.SHA1();
module.exports = function(str) {
  var hex = SHA1.hex(str);
  var id = hex.substring(5, 17);
  console.log(id);
  return mongoose.Types.ObjectId(hex.substring(5, 17)); // return 12 byte mongoose Object ID
};