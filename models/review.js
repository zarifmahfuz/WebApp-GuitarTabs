const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
	rating: {
		type: Number,
		required: "Please provide a rating (1-5 stars).",
		min: 1,
		max: 5,
		// adding validation to see if the entry is an integer
		validate: {
			validator: Number.isInteger,
			message: "{VALUE} is not an integer value."
		}
	},
	// review text
	text: {
		type: String
	},
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		username: String
	},
	// guitar tab associated with the review
	tab: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Campground"
	}
}, {
	timestamps: true
});

module.exports = mongoose.model("Review", reviewSchema);