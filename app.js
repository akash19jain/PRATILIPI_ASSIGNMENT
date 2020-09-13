var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local');
var passportLocalMongoose = require('passport-local-mongoose');
var User = require("./models/user");
var Story = require("./models/story");
var flash = require("connect-flash");
var user = require("./models/user");
var stories = require("./models/story");
mongoose.connect("mongodb+srv://akash_pratilipi:pratilipi@cluster0.o7veh.mongodb.net/<dbname>?retryWrites=true&w=majority", {
	useNewUrlParser: true,
	useUnifiedTopology: true
})
.then(() => console.log('Connected to DB!'))
.catch(error => console.log(error.message));



var app = express();

app.use(express.static('public'));
app.use('/assets',express.static(__dirname + 'public/assets'));

app.set('views','./views')
app.set("view engine","ejs");

app.use(require("express-session")({
	secret: "HI THIS IS A PROJECT FOR PRATILIPI",
	resave: false,
	saveUninitialized: false
}));
app.use(flash());
app.use(bodyParser.urlencoded({extended: true}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//EXAMPLE THAT WAS USED TO ENTER A VALUE TO THE STORIES DATABASE
// Story.create({
// 	title:"NATHULA PASS ",
// 	image: "https://www.esikkimtourism.in/wp-content/uploads/2019/04/nathulpas.jpg",
// 	body: "The once a part of the historic ‘Silk Road’, a visit to Nathu La is a must in any of the Sikkim travel packages. One of the highest motorable pass in the world, this amazing pass is located at a towering height of 4,310m above the sea level and connects Sikkim with Tibet. The pass is open to Indians; however, one has to obtain permission from the tourism department in order to visit this pass. And for the foreign national, they cannot make it to Nathu La."
// });

//global
app.use(function(req,res,next){
	res.locals.currentUser = req.User;
	res.locals.success = req.flash("success");
	res.locals.error = req.flash("error");
	next();
});

//REDIRECTS YOU TO THE HOME PAGE
app.get("",function(req,res){
	res.redirect("/home");
});
app.get("/",function(req,res){
	res.redirect("/home");
});

//SHOWS THE LOGIN FORM
app.get("/home",function(req,res){
	res.render("login");
});

app.post("/home", passport.authenticate("local", {
    successRedirect: "/stories",
    failureRedirect: "/home",
    failureFlash : true
}) ,function(req, res){
});

//SHOWS THE FORM FOR REGISTRATION
app.get("/register",function(req,res){
	res.render("register");
});

app.post("/register",function(req,res){
	User.register(new User({username: req.body.username}), req.body.password, function(err, user){
        if(err){
            req.flash("error",err.message);
            return res.redirect('/register');

        }
        passport.authenticate("local")(req, res, function(){
           res.redirect("/stories");
        });
    });
});

//SHOWS ALL THE STORIES
app.get("/stories",isLoggedIn,function(req,res){
	Story.find({}, function(err,stories){
		if(err)
			console.log("ERROR");
		else
			res.render("stories",{stories:stories});
	});
});

//SHOWS A SPECIFIC STORY
app.get("/stories/:id",isLoggedIn,function(req,res){
	Story.findById(req.params.id, function(err, found){
		if(err)
		{
			res.redirect("/stories");
		}
		else
		{
			var tempUser = req.user.username;
			var tempId = req.params.id;
			var tempStory = found.view_count;
			//console.log(tempUser);
			//console.log(tempId);
			//console.log(tempStory);

			//COUNT THE NUMBER OF UNIQUE USERS
			if(tempStory.indexOf(tempUser)==-1)
			{
				//console.log("HERE");
				tempStory.push(tempUser);
				//console.log(tempStory);
				stories.updateOne(
					{ "_id":tempId},
					{ $push: {view_count:tempUser}
       			 },function(err,req){
       			 	if(err)
       			 		console.log(err);
       			 });
			}
			var count=tempStory.length;
			res.render("show", {story: found,count:count});
		}
	});
});

//WHEN A USER CLICKS ON LOGOUT
app.get("/logout", function(req, res){
    req.logout();
    req.flash("success","LOGGED YOU OUT!!");
    res.redirect("/home");
});

//middleware
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/home");
};

app.listen(process.env.PORT || 3000,function(){
	console.log("SERVER STARTED");
});