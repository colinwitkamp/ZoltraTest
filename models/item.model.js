var mongoose = require('mongoose');
var ItemSchema = mongoose.Schema({

	id: String,
	category: Number,
	description: String,
	difficulty: Number,
	image: String,
	likes: Object,
	rating: Object,
	requirements: Object,
	skills: [String],
    steps: [String],
    timestamp: Number,
    timestampDesc: Number,
    title: String,
    userId: String,
    video: Object
});
var Item = mongoose.model('Item', ItemSchema);
module.exports = Item;

/*
- id - Firebase Item Key
- category _
- subCategory 
- title (lowecased)
- img thumbnail (uploaded img (aws url) or wistia img filters attached)
- avgRating
- timestemp
- ratingUserCount (number of users rated this guide)
- userRated (boolean)
- collectState (boolean)
- numOfViews (Wistia API, described below under Indexing)
- likes count (number)
- userLiked (boolean) if userId is passed, checks in index if user already liked
- userdata:
- name: nickname if exist or full name if not
- avatar (img thumbnail of profile image user.avatar)
- userId
*/

/*
- id
- timestemp
- title lowecased
- category
- duration
- description
- description lowecased (for search queries?)
- video obj (item.video), update with wistia data API, TBD
- video hashed id
- thumbnail
- duration
- viewsCount - should update chronicaly each request to wistia api should be timed, and up to 90-100 requests per minute for chron updating, should be configured.
- videoResolutionsOBJ (contains sized and sources of videos, for external players) TBD
- userdata:
- name
- title
- avatar
- like list (array of users who liked this - item.likes)
- like count
- step list (item.steps)
- stepState (bool, has steps or not)
- requirement list (item.requirements)
- requirementState (bool, has steps or not)
- success list (search here for “get guide success” fb query)
- id
- title -  of guide (item.title)
- success img arr (as is)
- review list (search here for “get guide / success reviews” fb query, use collection “successes”)
- review count (number)
- timestemp
- success count (number)
- review list (search here for “get guide / success reviews” fb query, use collection “videos”)
- review count (number)
*/