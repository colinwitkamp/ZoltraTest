/**
 * Created by colin on 12/2/16.
 */
var mongoose = require('mongoose');
const Schema = mongoose.Schema;
var ReviewSchema = mongoose.Schema({

  idt: {
    type: String,
    unique: true,
    index: true,
    required: true
  }
});

var Review = mongoose.model('Review', ReviewSchema);
module.exports = Review;
