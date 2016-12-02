/**
 * Created by colin on 12/2/16.
 */
var mongoose = require('mongoose');
const Schema = mongoose.Schema;
var SuccessSchema = mongoose.Schema({

  successId: {
    type: String,
    unique: true,
    index: true,
    required: true
  },
  id: {
    type: String,
    index: true
  },
  likes: Object,
  success_content: Object,
  timestamp: Number,
  userId: String,

  userId_ref: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  guideId_ref: {
    type: Schema.Types.ObjectId,
    ref: 'Item'
  },
  likes_ref: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  successes_ref: [ {
    type: Schema.Types.ObjectId,
    ref: 'Success'
  }]
});

var Success = mongoose.model('Success', SuccessSchema);
module.exports = Success;
