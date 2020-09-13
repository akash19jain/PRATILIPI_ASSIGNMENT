var mongoose = require('mongoose');

var StorySchema = new mongoose.Schema({
	title: String,
	body: String,
	image: String,
	created: {type: Date, default: Date.now},
	view_count: [String]
});

module.exports = mongoose.model("Story", StorySchema);