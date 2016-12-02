/**
 * Created by colin on 12/2/16.
 */
var User = require('../models/user.model');
module.exports = function(req, res, next) {
  const myUserId = req.headers.myuserid;
  
  // myUserId exists
  if( myUserId ) {
     User.findOne({
       id: myUserId
     }, function (err, user) {
       if (user) {
         req.user = user;
         next();
       } else {
         res.status(400).send({
           err: err
         });
       }
     });
  } else { // myUserId does not exist
    next();
  }
};