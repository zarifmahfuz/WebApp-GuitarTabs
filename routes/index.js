const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");

router.get("/", function(req, res) {
	res.render("landing");
});

// AUTHENTICATION ROUTES
// show register form
router.get("/register", (req,res)=>{
	res.render("register");
});

// handle sign up logic
router.post("/register", async (req,res)=>{
	try {
		const newUser = new User({username: req.body.username});
		const user = await User.register(newUser, req.body.password);
		passport.authenticate("local")(req,res,()=>{
			req.flash("success", "Welcome, " + user.username);
			res.redirect("/tabs");
		});
	} catch (err) {
		req.flash("error", err.message);
		return res.redirect("/register");
	}
});

// show login form
router.get("/login", (req,res)=>{
	res.render("login");
});

// handle login logic
router.post("/login", passport.authenticate("local", {
	successRedirect: "/tabs",
	failureRedirect: "/login"
}), (req,res)=>{
});

// LOGOUT ROUTE
router.get("/logout", (req,res)=>{
	req.logout();
	req.flash("success", "Logged you out!");
	res.redirect("/tabs");
});

module.exports = router;