const mongoose = require('mongoose');
const admin = require('firebase-admin'); // Firebase Admin SDK

const async = require('asyncawait/async');
const await = require('asyncawait/await');
var db = admin.database();
var User = require('../models/user.model');
var Item = require('../models/item.model');
var Success = require('../models/success.model');
const fireToMongo = require('../lib/fireMongo');

const mongooseSuccess = function (success, callback) {

  // userId_ref
  if (success.userId) {
    success.userId_ref = fireToMongo(success.userId);
  }

  // guideId_ref
  if (success.id) {
    success.guideId_ref = fireToMongo(success.id);
  }

  // likes_ref
  const likes = success.likes;
  var likes_ref = [];
  if (likes) {
    for (var key in likes) {
      const like = likes[key];
      const userId = like.userId;
      if (userId) {
        likes_ref.push(fireToMongo(userId));
      }
    }
  }
  success.likes_ref = likes_ref;

  success.save(callback);
};

const addChangeSuccess = async(function (snapshot) {
  const successId = snapshot.key;
  const successVal = snapshot.val();
  const prevSuccess = await(Success.findOne({
    successId: successId
  }));
  if (prevSuccess) { //  prev Success found
    const new_success = Object.assign(prevSuccess, successVal);
    mongooseSuccess(new_success, function (err, savedSuccess) {
      if (savedSuccess) {
        console.log('Success changed: ' + successId );
      } else { // Unable to save succes
        console.log('Unable to change success: ' + successId );
        console.log(err);
      }
    })
  } else { // index new Success
    const success = new Success(successVal);
    success._id = fireToMongo(successId);
    success.successId = successId;
    mongooseSuccess(success, function (err, savedSuccess) {
      if (savedSuccess) {
        console.log('New success created: ' + successId );
      } else { // Unable to save succes
        console.log('Unable to crate new success: ' + successId );
        console.log(err);
      }
    });
  }
});

const removeSuccess = function (snapshot) {
  const successId = snapshot.key;
  Success.findOneAndRemove({
    successId: successId
  }, function(err, result) {
    if (err) {
      console.log('Unable to remove Success: ' + successId)
    }
  });
};

const indexSucess = function() {
  Success.remove({}, function(err, result) {
    var userRef = db.ref('successes');
    userRef.on('child_added', addChangeSuccess);
    userRef.on('child_changed', addChangeSuccess);
    userRef.on('child_removed', removeSuccess);
  });
};

module.exports = {
  indexSucess: indexSucess
};