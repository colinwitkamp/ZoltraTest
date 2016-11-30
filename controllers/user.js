
var admin = require('firebase-admin'); // Firebase Admin SDK
var db = admin.database();
var User = require('../models/user.model');

function getUser(req, res, next) {

  var userId = req.params.userId;
  console.log('Get User: ' + userId);	
  
  // Find User by id
  User.findOne({
  	id: userId
  }, function(err, user) {
  	if (err) {
  	  res.status(404).json({
  	  	err: err
  	  });	
  	} else {
  	  res.json(user);	
  	}
  })

  //res.render('index', { title: 'getUser' });
}


function addChangeUser(snapshot) {
  var key = snapshot.key; // user id **caution** _id is the mongodb id
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
  	  changedUser.save(function(errChangedUser, result) {
  	  	if (errChangedUser) {
  	  	  console.log('Unable to changed user: ' + key);
  	  	} else {
  	  	  console.log('Successfully change user: ' + key);	
  	  	}
  	  });	
  	} else { // user was not saved in MongoDB, so create a new user
  	  var newUser = new User(user);
  	  newUser.save(function(errNewUser, result) {
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