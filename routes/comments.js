const express = require("express");
const router = express.Router({mergeParams: true});
const Tab = require("../models/tab");
const Comment = require("../models/comment");
const middleware = require("../middleware");

// NEW - show comments form 
router.get("/new", middleware.isLoggedIn, async (req,res)=>{
	try{
		const foundTab = await Tab.findById(req.params.id);
		res.render("comments/new", {tab: foundTab});
	} catch (err) {
		console.log(err);
	}
});

// CREATE - add a new comment
router.post("/", middleware.isLoggedIn, async (req,res)=>{
	try {
		const tab = await Tab.findById(req.params.id);
		const comment = await Comment.create(req.body.comment);
		comment.author.id = req.user._id;
		comment.author.username = req.user.username;
		comment.save();

		// add this comment to ttab
		tab.comments.push(comment);
		tab.save();
		req.flash("success", "Successfully added comment");
		res.redirect("/tabs/" + tab._id);

	} catch (err) {
		console.log(err);
		req.flash("error", "Oops! Something went wrong!");
		res.redirect("/tabs");
	}
});

// EDIT - show edit comment form
router.get("/:comment_id/edit", middleware.checkCommentOwnership, async (req,res)=>{
	try {
		const foundTab = await Tab.findById(req.params.id);
		if (!foundTab) {
			// protection against absurd get requests
			req.flash("error", "Tab not found");
			return res.redirect("back");
		}
		const foundComment = await Comment.findById(req.params.comment_id);
		res.render("comments/edit", {tab_id: req.params.id, comment: foundComment}); // redirect to the edit form
	} catch (err) {
		req.flash("error", "Oops! Something went wrong!");
		res.redirect("back");
	}
});

// UPDATE - update the comment according the edit form
router.put("/:comment_id", middleware.checkCommentOwnership, async (req,res)=>{
	try {
		const updatedComment = await Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment);
		req.flash("success", "Updated comment");
		res.redirect("/tabs/" + req.params.id);
	} catch (err) {
		req.flash("error", "Oops! Something went wrong!");
		res.redirect("back");
	}
});

// DESTROY - delete a comment
router.delete("/:comment_id", middleware.checkCommentOwnership, async (req,res)=>{
	try {
		await Comment.findByIdAndRemove(req.params.comment_id);
		req.flash("success", "Comment deleted");
		res.redirect("/tabs/" + req.params.id);
	} catch (err) {
		console.log(err);
		req.flash("error", "Oops! Something went wrong!");
		res.redirect("back");
	}
});

module.exports = router;