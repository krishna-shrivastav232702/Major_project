if(process.env.NODE_ENV!=="production"){
require('dotenv').config()
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const expressError = require("./utils/expressError.js");


const dbUrl=process.env.ATLASDB_URL;


const reviewRouter = require("./routes/review.js");
const listingRouter = require("./routes/listing.js");
const userRouter = require("./routes/user.js");


const session=require("express-session");
const MongoStore = require('connect-mongo');
const flash=require("connect-flash");
const passport=require("passport");
const LocalStratergy=require("passport-local");
const User=require("./models/user.js");


main().then(() => {
    console.log("connected to db");
}).catch(err => {
    console.log(err);
});



async function main() {
    await mongoose.connect(dbUrl);
    console.log("connected to mongo db");
}



app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const store=MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter:24*3600,
})



store.on("error",()=>{
    console.log("Error in mongo session store");
})


const sessionOptions={
    store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+9*24*60*60*1000,
        maxAge:9*24*60*60*1000,
        httpOnly:true,
    },

};





// app.get("/", (req, res) => {
//     res.send("Hi, i am root");
// });


app.use(session(sessionOptions));
app.use(flash());


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStratergy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser()); //static serialize and deserialize methods are provided by passport-local-mongoose
//passport-local-mongoose is a plugin for passport that simplifies the process of authenticating with a username and password
//passport to serialize and deserialize user into session






app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    next();
});


// app.get("/demouser",async(req,res)=>{
//     let fakeUser=new User({
//         email:"student@gmail.com",
//         username:"student1"
//     });
//    let registeredUser=await User.register(fakeUser,"helloWorld");//fake user and password
//     res.send(registeredUser);
// });


app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);



// app.get("/testListing",async (req,res)=>{
//     let sampleListing=new Listing({
//         title:"My new villa",
//         description:"by the beach",
//         price:1200,
//         location:"calangute,Goa",
//         country:"India",
//     });
//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successful testing");
// });




app.all("*", (req, res, next) => {
    next(new expressError(404, "Page not found"));
});




app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).render("listings/error.ejs", { message });
    // res.status(statusCode).send(message);
})


app.listen(8080, () => {
    console.log("server is listening to port 8080");
});