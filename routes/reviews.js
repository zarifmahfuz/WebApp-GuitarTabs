const express = require("express");
const router = express.Router({mergeParams: true});
const Tab = require("../models/tab");
const Review = require("../models/review");
const middleware = require("../middleware");

// Reviews INDEX
router.get("/", async (req,res)=>{
	try {
		const foundTab = await Tab.findById(req.params.id).populate({
			path: "reviews",
			options: {sort: {createdAt: -1}} // sort to show latest reviews first
		}).exec();
		if (!foundTab) {
			req.flash("error", "Oops! Something went wrong!");
			return res.redirect("back");
		}
		res.render("reviews/index", {tab: foundTab});
	} catch (err) {
		req.flash("error", err.message);
		return res.redirect("back");
	}
});

// Reviews NEW
router.get("/new", middleware.isLoggedIn, middleware.checkReviewExistence, async (req,res)=>{
	// middleware.checkReviewExistence checks if a user already reviewed the tab, only one review per user is allowed
	try {
		const foundTab = await Tab.findById(req.params.id);
		res.render("reviews/new", {tab: foundTab});
	} catch (err) {
		req.flash("error", err.message);
		return res.redirect("back");
	}
});

// Reviews CREATE
router.post("/", middleware.isLoggedIn, middleware.checkReviewExistence, async (req,res)=>{
	try {
		const foundTab = await Tab.findById(req.params.id).populate("reviews").exec();
		const newReview = await Review.create(req.body.review);
		
		newReview.author.id = req.user._id;
		newReview.author.username = req.user.username;
		newReview.tab = foundTab;
		newReview.save();
		foundTab.reviews.push(newReview);
		foundTab.rating = calculateAverage(foundTab.reviews); // recompute the average rating
		foundTab.save();
		req.flash("success", "Your review has been successfully added.");
		res.redirect("/tabs/" + foundTab._id);
	} catch (err) {
		//console.log(req.body.review);
		req.flash("error", err.message);
		return res.redirect("back");
	}
});

// Review EDIT
router.get("/:review_id/edit", middleware.checkReviewOwnership, async (req,res)=>{
	try {
		const foundReview = await Review.findById(req.params.review_id);
		res.render("reviews/edit", {tab_id: req.params.id, review: foundReview});
	} catch (err) {
		req.flash("error", err.message);
		return res.redirect("back");
	}
});

// Review UPDATE
router.put("/:review_id", middleware.checkReviewOwnership, async (req,res)=>{
	try {
		const updatedReview = await Review.findByIdAndUpdate(req.params.review_id, req.body.review, {new: true});
		const foundTab = await Tab.findById(req.params.id).populate("reviews").exec();
		foundTab.rating = calculateAverage(foundTab.reviews); // recompute the rating average
		foundTab.save();
		req.flash("success", "Your review was successfully edited.");
		res.redirect("/tabs/" + foundTab._id);
	} catch (err) {
		req.flash("error", err.message);
		return res.redirect("back");
	}
});

// Review DELETE
router.delete("/:review_id", middleware.checkReviewOwnership, async (req,res)=>{
	try {
		await Review.findByIdAndRemove(req.params.review_id);
		const foundTab = await Tab.findByIdAndUpdate(req.params.id, {$pull: {reviews: req.params.review_id}}, {new:true}).populate("reviews").exec();
		foundTab.rating = calculateAverage(foundTab.reviews); // recompute rating average
		foundTab.save();

		req.flash("success", "Your review was successfully deleted");
		res.redirect("/tabs/" + req.params.id);

	} catch (err) {
		req.flash("error", err.message);
		res.redirect("/tabs/" + req.params.id);
	}
});

function calculateAverage(reviews) {
    if (reviews.length === 0) {
        return 0;
    }
    var sum = 0;
    reviews.forEach(function (element) {
        sum += element.rating;
    });
    return sum / reviews.length;
}

module.exports = router;