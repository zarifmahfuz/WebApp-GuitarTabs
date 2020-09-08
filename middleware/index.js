const Tab = require("../models/tab");
const Comment = require("../models/comment");
const Review = require("../models/review");

// all the middleware goes here 
const middlewareObj = {}

middlewareObj.checkTabOwnership = function(req,res,next) {
	// check if the user is logged in
	if (req.isAuthenticated()) {
		Tab.findById(req.params.id, function(err, foundTab){
			if (err || !foundTab) {
				req.flash("error", "Tab not found");
				res.redirect("back");
			} else {
				// does the user own the guitar tab post?
				if (foundTab.author.id.equals(req.user._id)) {
					next();
				} else {
					req.flash("error", "You do not have permission to do that");
					res.redirect("back");
				}
			}
		});
	} else {
		req.flash("error", "You need to be logged in to do that");
		res.redirect("back");
	}
}

middlewareObj.checkCommentOwnership = function(req,res,next) {
	// check if the user is logged in
	if (req.isAuthenticated()) {
		Comment.findById(req.params.comment_id, function(err, foundComment){
			if (err || !foundComment) {
				req.flash("error", "Comment not found");
				res.redirect("back");
			} else {
				// does the user own the comment?
				if (foundComment.author.id.equals(req.user._id)) {
					next();
				} else {
					req.flash("error", "You do not have permission to do that");
					res.redirect("back");
				}
			}
		});
	} else {
		req.flash("error", "You need to be logged in to do that");
		res.redirect("back");
	}
}

middlewareObj.checkReviewOwnership = function(req, res, next) {
    if(req.isAuthenticated()){
        Review.findById(req.params.review_id, function(err, foundReview){
            if(err || !foundReview){
            	req.flash("error", "Review not found");
                res.redirect("back");
            } else {
                // does user own the review?
                if(foundReview.author.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
};

middlewareObj.checkReviewExistence = function (req, res, next) {
    if (req.isAuthenticated()) {
        Tab.findById(req.params.id).populate("reviews").exec(function (err, foundTab) {
            if (err || !foundTab) {
                req.flash("error", "Tab not found");
                res.redirect("back");
            } else {
                // check if req.user._id exists in foundTab.reviews
                const foundUserReview = foundTab.reviews.some(function (review) {
                    return review.author.id.equals(req.user._id);
                });
                if (foundUserReview) {
                    req.flash("error", "You already wrote a review.");
                    return res.redirect("/tabs/" + foundTab._id);
                }
                // if the review was not found, go to the next middleware
                next();
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
};

middlewareObj.isLoggedIn = function(req,res,next) {
	if (req.isAuthenticated()){
		return next();
	} else {
		req.flash("error", "You need to be logged in to do that");
		res.redirect("/login");
	}
}

module.exports = middlewareObj;