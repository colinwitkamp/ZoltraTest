var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = mongoose.Schema({

  id: {
    type: String,
	unique: true,
	index: true,
	required: true
  },
  avatar: String,
  email: String,
  followers: Object,
  following: Object,
  name: String,
  nickname: String,
  provider: String,
  title: String,
  collect: Object,
  coverPhoto: String,

  // Reference fields
  followers_ref: [
  	{
  	  type: Schema.Types.ObjectId,
  	  ref: 'User'
  	}
  ],
  following_ref: [
  	{
  	  type: Schema.Types.ObjectId,
  	  ref: 'User'
  	}
  ]
});

UserSchema.index({
  name: 'text',
  title: 'text'	
});

var User = mongoose.model('User', UserSchema);
module.exports = User;