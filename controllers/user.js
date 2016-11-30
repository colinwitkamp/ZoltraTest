
const mongoose = require('mongoose');
var admin = require('firebase-admin'); // Firebase Admin SDK
var db = admin.database();
var User = require('../models/user.model');
const async = require('asyncawait/async');
const await = require('asyncawait/await');

const fireToMongo = require('../lib/fireMongo');

function getUser(req, res, next) {

  var userId = req.params.userId;
  console.log('Get User: ' + userId);	
  
  // Find User by id
  User.findOne({
  	id: userId
  })
  .populate('followers_ref')
  .populate('following_ref')
  .exec(function(err, user) {

  	if (err) {
  	  res.status(500).json({
  	  	err: err
  	  });	
  	} else {
  	  if(user) {
		res.json(user);	  	  	
  	  } else {
  	  	res.status(404).json({
  	  		err: 'Unable to find the user:' + userId
  	  	});
  	  }
  	}
  })
  //res.render('index', { title: 'getUser' });
}

// Index the user find following and followed users and index them
const mongooseUser = async (function (user, callback) {
  
  // index followers
  const followers = user.followers;
  var dicFollowers = {};

  if (followers) {
  	// console.log(followers);
	var aryFollowerID = [];
	// Collect followers user ids to aryFollowerID
	var followers_ref = [];
	for (var key in followers) {
	  var id = followers[key].userId;
	  // console.log('Hash Input:' + id);
	  followers_ref.push(mongoose.Types.ObjectId(fireToMongo(id)));
	  aryFollowerID.push(id);
	}
	user.followers_ref = followers_ref;
  }

  // index following

  const following = user.following;
  if (following) {
  	console.log(following);
	var aryFollowingID = [];
	// Collect following user ids to aryFollowingID
	var following_ref = [];
	for (var key in following) {
	  const id = following[key].userId;
	  console.log('Hash Input:' + id);
	  following_ref.push(mongoose.Types.ObjectId(fireToMongo(id)));
	  aryFollowingID.push(id);
	}
	user.following_ref = following_ref;
  }

  user.followers = aryFollowerID;
  user.following = aryFollowingID;
  // Finally Save User
  user.save(callback);  	
});

function addChangeUser(snapshot) {
  var key = snapshot.key; // user id **caution** _id is the mongodb id
  console.log(key);
  var user = snapshot.val();
  if (user) {
  	user.id = key;
  } else {
  	console.log('Empty User! : ' + key);
  }

  // Try to find the previous user
  User.findOne({
  	id: key
  }, function(err, prevUser) {
  	
  	if (prevUser) { // user is already in MongoDB, so change it 
  	  var changedUser = Object.assign(prevUser, user);
  	  // console.log(JSON.stringify(changedUser));
  	  mongooseUser(new User(changedUser), function(errChangedUser, result) {
  	  	if (errChangedUser) {
  	  	  console.log('Unable to change user: ');
  	  	  console.log(key);
  	  	} else {
  	  	  console.log('Successfully changed user: ');
  	  	  console.log(key);	
  	  	}
  	  });	
  	} else { // user was not saved in MongoDB, so create a new user
  	  var newUser = new User(user);
  	  // Unique _id for key
  	  newUser._id = mongoose.Types.ObjectId(fireToMongo(key));
  	  mongooseUser(newUser, function(errNewUser, result) {
  	  	if (errNewUser) {
  	  	  console.log('Unable to create user: ' + key);
  	  	} else {
  	  	  console.log('Successfully created user: ' + key);	
  	  	}
  	  });
  	}
  });
}

function removeUser() {
  var key = snapshot.key; // user id **caution** _id is the mongodb id

  User.findOneAndRemove({
    id: key
  }, function(err, result) {
  	if (err) {
	  console.log('Unable to remove: ' + key)
  	}
  });

}

function indexUser() {
  var userRef = db.ref('users');
  userRef.on('child_added', addChangeUser);
  userRef.on('child_changed', addChangeUser);
  userRef.on('child_removed', removeUser); 
}

module.exports = {
  getUser: getUser,
  indexUser: indexUser
};