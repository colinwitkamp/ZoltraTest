
var admin = require('firebase-admin'); // Firebase Admin SDK
var db = admin.database();
var User = require('../models/user.model');
const async = require('asyncawait/async');
const await = require('asyncawait/await');

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
	var aryFollowerID = [];
	// Collect followers user ids to aryFollowerID
	for (var key in followers) {
	  aryFollowerID.push(followers[key].userId);
	}
	// console.log(aryFollowerID);

	// Find user ids with id of aryFollowerID
	var followerUsers = await(User.find({
	  id: {
	  	$in: aryFollowerID
	  }
	}));

	// Not found
	if (!followerUsers) {

	  followerUsers = [];
	}

	// make dic for searching easily
	for (var i in followerUsers) {
	  var _user = followerUsers[i];
	  dicFollowers[_user.id] = _user;
	}

	// iterate aryFollowerID
	var followers_ref = [];

	for (var i in aryFollowerID) {
	  var id = aryFollowerID[i];
	  // console.log('id' + id);
	  var prevUser = dicFollowers[id];
	  if (prevUser) { // already indexed the user
	  	followers_ref.push(prevUser._id); // append to the array of followers
	  } else { // No indexed User found
	  	
	  }
	}
	user.followers_ref = followers_ref;
  }

  // index following

  const following = user.following;
  if (following) {
	var aryFollowingID = [];
	// Collect following user ids to aryFollowingID
	for (var key in following) {
	  aryFollowingID.push(following[key].userId);
	}
	// console.log(aryFollowerID);

	// Find user ids with id of aryFollowerID
	var followingUsers = await(User.find({
	  id: {
	  	$in: aryFollowingID
	  }
	}));

	// Not found
	if (!followingUsers) {
	  followingUsers = [];
	}

	// make dic for searching easily - shares dicFollowers
	for (var i in followingUsers) {
	  var _user = followingUsers[i];
	  dicFollowers[_user.id] = _user;
	}

	// iterate aryFollowingID
	var following_ref = [];
	for (var i in aryFollowingID) {
	  var id = aryFollowingID[id];
	  // console.log('id' + id);
	  var prevUser = dicFollowers[id];
	  if (prevUser) { // already indexed the user
	  	following_ref.push(prevUser._id); // append to the array of following
	  } else { // No indexed User found
	  	
	  }
	}
	user.following_ref = followers_ref;
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