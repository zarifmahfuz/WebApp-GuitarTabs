const express = require("express");
const router = express.Router();
const Tab = require("../models/tab");
const Review = require("../models/review");
const middleware = require("../middleware");

// INDEX - show all tabs
router.get("/", async (req,res) => {
	try {
		const allTabs = await Tab.find({});
		res.render("tabs/index", {tabs: allTabs, currentUser: req.user});
	} catch(err) {
		console.log(err);
	}
});

// NEW - show form to create new memory
router.get("/new", middleware.isLoggedIn, (req, res) => {
	res.render("tabs/new");
});

// CREATE - add a new tab to the database
router.post("/", middleware.isLoggedIn, async (req,res) => {
	try {
		// get data from the form and create a tab object
		const songName = req.body.songName;
		const artist = req.body.artist;
		const album = req.body.album;
		const year = req.body.year;
		const image = req.body.image;
		const desc = req.body.description;
		const author = { id: req.user._id, username: req.user.username };
		const newTab = {songName:songName, artist:artist, album:album, year: year, image:image, description:desc, author:author};
		// create a new tab and save to database
		newlyCreated = await Tab.create(newTab);
		res.redirect("/tabs");
	} catch(err) {
		console.log(err);
	}
});

// SHOW - show full details about a tab
router.get("/:id", function(req,res) {
	Tab.findById(req.params.id).populate("comments").populate({
		path: "reviews",
		options: {sort: {createdAt: -1}}
	}).exec(function(err, foundTab) {
		if (err || !foundTab) {
			req.flash("error", "Tab not found");
			res.redirect("back");
		} else {
			// render the show template with that tab
			res.render("tabs/show", {tab: foundTab});
		}
	});
});

// EDIT - edit a tab
router.get("/:id/edit", middleware.checkTabOwnership, async (req,res) => {
	try {
		foundTab = await Tab.findById(req.params.id);
		res.render("tabs/edit", {tab: foundTab});
	} catch(err) {
		console.log(err);
	}
});

// UPDATE - update a tab
router.put("/:id", middleware.checkTabOwnership, async (req,res) => {
	try {
		const updatedTab = await Tab.findByIdAndUpdate(req.params.id, req.body.tab);
		req.flash("success", "Successfully Updated!");
		res.redirect("/tabs/"+req.params.id);
	} catch(err) {
		req.flash("error",err.message);
		res.redirect("back");
	}
});

// DESTROY - delete a tab
router.delete("/:id", middleware.checkTabOwnership, async (req,res) => {
	try {
		const foundTab = await Tab.findById(req.params.id);
		await foundTab.remove();
		res.redirect("/tabs");
	} catch (err) {
		req.flash("error", "Could not delete the tab");
		res.redirect("/tabs");
	}
});

module.exports = router;