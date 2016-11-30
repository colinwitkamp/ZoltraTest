var express = require('express');
var router = express.Router();
var itemCtrl = require('../controllers/item');
var collectionCtrl = require('../controllers/collection');
var userCtrl = require('../controllers/user');

// - api/GetItems (GET)
router.get('/api/GetItems', itemCtrl.getItems);

// - api/GetItem (GET)
router.get('/api/GetItem', itemCtrl.getItem);


// - api/GetCollection
router.get('/api/GetCollection', collectionCtrl.getCollections);

// - api/GetUser
router.route('/api/user/:userId').get( userCtrl.getUser);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
