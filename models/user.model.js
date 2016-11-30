var mongoose = require('mongoose');
var UserSchema = mongoose.Schema({

  id: {
    type: String,
    index: true
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
  coverPhoto: String
});

UserSchema.index({
  name: 'text',
  title: 'text'	
});

var User = mongoose.model('User', UserSchema);
module.exports = User;