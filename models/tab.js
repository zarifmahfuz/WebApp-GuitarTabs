const mongoose = require("mongoose");
const Comment = require("./comment");
const Review = require("./review");

const tabSchema = new mongoose.Schema({
	songName: String,
	artist: String,
	image: String,
	description: String,
	createdAt: { type: Date, default: Date.now },
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		username: String
	},
	comments: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Comment"
		}
	],
	reviews: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Review"
		}
	],
	rating: {
		type: Number,
		default: 0
	}
});

// setup for deleting all comments and reviews associated with a tab at the time of deleting a tab
tabSchema.pre("remove", async ()=>{
	await Comment.remove({
		_id: {
			$in: this.comments
		}
	});
	await Review.remove({
		_id: {
			$in: this.reviews
		}
	});
});

module.exports = mongoose.model("Tab", tabSchema);