const express 				= require("express"),
	  app 					= express(),
	  bodyParser 			= require("body-parser"),
	  mongoose 				= require("mongoose"),
	  flash 				= require("connect-flash"),
	  passport 				= require("passport"),
	  localStrategy 		= require("passport-local"),
	  passportLocalMongoose = require("passport-local-mongoose"),
	  methodOverride 		= require("method-override"),
	  Memory 				= require("./models/tab"),
	  Comment 				= require("./models/comment"),
	  User 					= require("./models/user");

const tabRoutes = require("./routes/tabs"),
	  commentRoutes = require("./routes/comments"),
	  reviewRoutes = require("./routes/reviews"),
	  indexRoutes = require("./routes/index");

// connect to database
mongoose.connect(process.env.DATABASEURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to DB!'))
.catch(error => console.log(error.message));

app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
app.locals.moment = require("moment");

// PASSPORT CONFIGURATION
app.use(require("express-session")({
	secret: process.env.SECRET,
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// this is added to every single template
app.use(function(req,res,next){
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});

app.use("/", indexRoutes);
app.use("/tabs", tabRoutes);
app.use("/tabs/:id/comments", commentRoutes);
app.use("/tabs/:id/reviews", reviewRoutes);

// Tell Express to listen for requests (start server)
const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("The Server Has Started!");
});