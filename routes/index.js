var express = require('express');
var router = express.Router();
var itemCtrl = require('../controllers/item');
var successCtrl = require('../controllers/success');
var userCtrl = require('../controllers/user');
var middleWare = require('../controllers/middleware');

router.route('/api').all(middleWare);
// - api/GetItems (GET)
router.get('/api/item', itemCtrl.getItems);

// - api /GetItem (GET)
router.route('/api/item/:itemId').get(itemCtrl.getItem);

// - api/GetCollection
// router.get('/api/GetCollection', successCtrl.getCollections);

// - api/GetUser
router.route('/api/user/:userId').get( userCtrl.getUser);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
