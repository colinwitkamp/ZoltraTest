
var admin = require('firebase-admin'); // Firebase Admin SDK
var db = admin.database();
var Item = require('../models/item.model');

function getItems(req, res, next) {
  var itemRef = db.ref('items');
  itemRef.once('value', function(snapshot) {
  	res.json(snapshot.val());
  });
  //  res.render('index', { title: 'getItems' });
}

function getItem(req, res, next) {
  
}

function addChangeItem(snapshot) {
  var key = snapshot.key; // item id **caution** _id is the mongodb id
  var item = snapshot.val();

  if (item) {
  	item.id = key;
  } else {
  	console.log('Empty Item! : ' + key);
  }
  
  Item.findOne({
  	id: key
  }, function(err, prevItem) {
  	if (prevItem) { // item is already in MongoDB, so change it 
  	  var changedItem = Object.assign(prevItem, item);
  	  changedItem.save(function(errChangedItem, result) {
  	  	if (errChangedItem) {
  	  	  console.log('Unable to change item: ' + key);
  	  	  console.log(errChangedItem);
  	  	} else {
  	  	  console.log('Successfully changed item: ' + key);	
  	  	}
  	  });	
  	} else { // item was not saved in MongoDB, so create a new item
  	  var newItem = new Item(item);
  	  newItem.save(function(errNewItem, result) {
  	  	if (errNewItem) {
  	  	  console.log('Unable to create item: ' + key);
  	  	  console.log(errNewItem);
  	  	} else {
  	  	  console.log('Successfully created item: ' + key);	
  	  	}
  	  });
  	}
  });
}

function removeItem() {
  var key = snapshot.key; // item id **caution** _id is the mongodb id

  Item.findOneAndRemove({
    id: key
  }, function(err, result) {
  	if (err) {
	  console.log('Unable to remove: ' + key)
  	}
  });

}

function indexItem() {
  var itemRef = db.ref('items');
  itemRef.on('child_added', addChangeItem);
  itemRef.on('child_changed', addChangeItem);
  itemRef.on('child_removed', removeItem); 
}


module.exports = {
  getItems: getItems,
  getItem: getItem,
  indexItem: indexItem
};