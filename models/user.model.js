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
  ],
  collect_ref: [
  	{
  	  type: Schema.Types.ObjectId,
  	  ref: 'Item'
  	}
  ]
});

UserSchema.index({
  name: 'text',
  title: 'text'	
});

UserSchema.set('toJSON', {
  transform: (doc, ret) => {
  	if (!doc.populated('following_ref')) {
  	  delete ret.following_ref;
  	}

  	if (!doc.populated('followers_ref')) {
  	  delete ret.followers_ref;
  	}

	if (!doc.populated('collect_ref')) {
  	  delete ret.collect_ref;
  	}  	

  	return ret;
  }
});

var User = mongoose.model('User', UserSchema);
module.exports = User;