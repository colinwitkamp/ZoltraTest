
const mongoose = require('mongoose');
const async = require('asyncawait/async');
const await = require('asyncawait/await');

var admin = require('firebase-admin'); // Firebase Admin SDK
var db = admin.database();
var Item = require('../models/item.model');
const fireToMongo = require('../lib/fireMongo');

function resizeFilter(url, size) {
	return (typeof url != 'undefined') ? url.split('?image_crop_resized=')[0] + '?image_crop_resized=' + size: null;
}

function transformItem(user, item, thumbnail_type) {
	var ret = {
		title: item.title,
		category: item.category,
		rating: item.rating,
		likes: {
			count: item.likeCount
			// status: - if myUserId is present
		},
		userData: {

		},
		stepCount: item.stepCount,
		requirementCount: item.requirementCount
	};
	if (user) {
		var collected = false;
		const collect = user.collect;
		for (var key in collect) {
			var myItem = collect[key];
			if (myItem.guideId === item.id) {
				collected = true;
				break;
			}
		}
		ret.collected = true;
	}
	// collected

	const userId_ref = item.userId_ref;

	if (userId_ref) {
		ret.userData.id = userId_ref.id;
		ret.userData.avatar = userId_ref.avatar;
		ret.userData.username = userId_ref.nickname || userId_ref.name;
		const followingObj = userId_ref.following;
		var following = false;
		if (followingObj) {
			for (var key in followingObj) {
				var myFollowing = followingObj[key];
				if(myFollowing) {
					if (myFollowing.userId === ret.userData.id) {
						following = true;
						break;
					}
				}
			}
		}
		ret.userData.following = following;
	}

	if (thumbnail_type) {
		if (item.video) {
			if (item.video.thumbnail) {
				ret.thumbnail = resizeFilter(item.video.thumbnail.url, thumbnail_type);
			}
		}
	}

	return ret;
}


function getItems(req, res, next) {
  var itemRef = db.ref('items');

	const myUserId = req.headers.myuserid;

	var cat = req.query.cat;
	var limit = parseInt(req.query.limited);
	var skip = parseInt(req.query.start);
	var sort_direction = req.query.sort;
	var thumbnail = req.query.thumbnail;
	var sortby = req.query.sortby;
	var key = req.query.key;
	var search_string = req.query.query;

	if (thumbnail) {
		if(!(thumbnail === 'xs' || thumbnail === 'sm' || thumbnail === 'md' || thumbnail === 'related') && thumbnail) {
			return res.status(400).json({
				err: 'Invalid thumbnail'
			});
		}
	} else {
		thumbnail = 'md';
	}

	var query = {};
	var sort_query = {};
	if (cat) {
		var cat_num = parseInt(cat);
		if (!isNaN(cat_num)) {
			query.category = parseInt(cat);
		}
	}

	if(isNaN(skip)) {
		skip = 0;
	}

	if (isNaN(limit)) {
		limit = 20; // default limit
	}

	if (sort_direction === 'asc') {
		sort_direction = 1;
	} else  if (sort_direction === 'desc') {
		sort_direction = -1;
	} else {
		sort_direction = 'asc';
	}

	if (sort_direction && sortby) {
		sort_query[sortby] = sort_direction;
	}

	if (key && search_string) {
		query[key] = new RegExp('^'+search_string+'$', "i");
	} else if (search_string) {
		query['$text'] = {
			$search: search_string
		};
	}
	console.log('Mongo Query:');
	console.log(query);
	var mongo_query = Item.find(query);
	if (sort_direction && sortby) {
		mongo_query = mongo_query.sort(sort_query);
	}
	mongo_query = mongo_query
		.populate('userId_ref')
		.skip(skip)
		.limit(limit);
	mongo_query.exec(function (err, items) {
		if (err) {
			return res.status(500).send({
				err: err
			});
		} else  {
			if (Array.isArray(items)) {
				var aryResultItems = [];
				for (var i in items) {
					aryResultItems.push(transformItem(req.user, items[i], thumbnail))
				}
				return res.json(aryResultItems);
			} else {
				res.status(500).json({
					err: 'Internal '
				})
			}
		}
	});
	//  res.render('index', { title: 'getItems' });
}

function getItem(req, res, next) {
	const itemId = req.params.itemId;

	/*
	 userId_ref: {
	 type: Schema.Types.ObjectId,
	 ref: 'User'
	 },
	 likes_ref: [{
	 type: Schema.Types.ObjectId,
	 ref: 'User'
	 }],
	 successes_ref: [{
	 type: Schema.Types.ObjectId,
	 ref: 'User'
	 }],
	 reviews_ref: [{
	 type: Schema.Types.ObjectId,
	 ref: 'Review'
	 }]
	*/

	Item.findOne({
		id: itemId
	})
		.populate('userId_ref')
		.populate('likes_ref')
		.populate('successes_ref')
		.exec(function (err, item) {
		if (item) {
			res.json(item);
		} else if (err){
			res.status(400).json({
				err: err
			});
		}
	});
}

const mongooseItem = async( function (item, callback) {
  // index userId => userId_ref
  item.userId_ref = mongoose.Types.ObjectId(fireToMongo(item.userId));

	// index likes => like_ref
	const likes = item.likes;
	const likes_ref = [];
	for (var key in likes) {
		const like = likes[key];
		const userId = like.userId;
		likes_ref.push(fireToMongo(userId));
	}
	item.likes_ref = likes_ref;
	item.likeCount = likes_ref.length;

	// Success list
	const successes_ref = [];
	const successes_snapshot = await(db.ref('successes')
		.orderByChild('id')
		.equalTo(item.id)
		.once('value'));

	if (successes_snapshot) {
		const s_list = successes_snapshot.val();
		if (s_list) {
			for (var key in s_list) {
				successes_ref.push(fireToMongo(key));
			}
		}
	}
	item.successes_ref = successes_ref;
	item.successCount = successes_ref.length;

	// calculate rating
	const rating  = item.rating;
	if (rating) {
		var avgRating = 0;
		var totalRate = 0;
		var totalCount = 0;
		const userList = rating.userList;
		var rate_list = [];
		for (var i in userList) {
			var userRate = userList[i];
			var userRating = userRate.userRating;
			if (!isNaN(userRating)) {
				totalRate = totalRate + userRating
				totalCount = totalCount + 1;
				rate_list.push(userRate);
			}
		}
		avgRating = totalRate / totalCount;
		if (avgRating < 0) {
			avgRating = 0;
		}

		if (avgRating > 5) {
			avgRating = 5;
		}
		item.avgRating = avgRating;
		item.rate_count = totalCount;
		item.rate_list = rate_list;
		item.rating = {};
	}


	/*
	*   // State
	 stepState: Boolean, // has steps or not
	 requirementState: Boolean, // has requirements or not
	 successCount: Number, // 
	 likeCount: Number,
	 reivewCount: Number,
	* 
	* */
	if (item.steps) {
		item.stepState = true;
	} else {
		item.stepState = false;
	}

	if (item.requirements) {
		item.requirementState = true;
	} else {
		item.requirementState = false;
	}
	
	item.save(callback);
});

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
			mongooseItem(changedItem, function(errChangedItem, result) {
  	  	if (errChangedItem) {
  	  	  console.log('Unable to change item: ' + key);
  	  	  console.log(errChangedItem);
  	  	} else {
  	  	  console.log('Successfully changed item: ' + key);	
  	  	}
  	  });	
  	} else { // item was not saved in MongoDB, so create a new item
  	  var newItem = new Item(item);
  	  newItem._id = mongoose.Types.ObjectId(fireToMongo(key));
  	  mongooseItem(newItem, function(errNewItem, result) {
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
  Item.remove({}, function(err, result) {
	var itemRef = db.ref('items');
    itemRef.on('child_added', addChangeItem);
    itemRef.on('child_changed', addChangeItem);
    itemRef.on('child_removed', removeItem); 
  });
}


module.exports = {
  getItems: getItems,
  getItem: getItem,
  indexItem: indexItem
};