if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ExpressError = require("./Utils/ExpressError");
const engine = require("ejs-mate");
const campgroundRoute = require("./Routes/campground");
const reviewRoute = require("./Routes/review");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const userRoute = require("./Routes/user");
const indexRoute = require("./Routes/index");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const MongoDBstore = require("connect-mongo");

//======================== HELMET CONFIG ====================================

const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net/",
  "https://res.cloudinary.com/yelp-camp112/",
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net/",
  "https://res.cloudinary.com/yelp-camp112/",
];
const connectSrcUrls = [
  "https://*.tiles.mapbox.com",
  "https://api.mapbox.com",
  "https://events.mapbox.com",
  "https://res.cloudinary.com/yelp-camp112/",
];
const fontSrcUrls = ["https://res.cloudinary.com/Yelp-Camp/"];

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [],
        connectSrc: ["'self'", ...connectSrcUrls],
        scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
        styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
        workerSrc: ["'self'", "blob:"],
        objectSrc: [],
        imgSrc: [
          "'self'",
          "blob:",
          "data:",
          "https://res.cloudinary.com/yelp-camp112/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
          "https://images.unsplash.com/",
        ],
        fontSrc: ["'self'", ...fontSrcUrls],
        mediaSrc: ["https://res.cloudinary.com/yelp-camp112/"],
        childSrc: ["blob:"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);
//======================== HELMET CONFIG ====================================
// process.env.DB_URL;
const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/yelp-camp";
mongoose.connect(dbUrl);
const db = mongoose.connection;
db.on("error", console.error.bind("connection errror:"));
db.once("open", () => {
  console.log("Database Opened");
});

const secret = process.env.SECRET || "thisisasecret";

const store = MongoDBstore.create({
  mongoUrl: dbUrl,
  secret,
  touchAfter: 24 * 60 * 60,
});

store.on("error", function (e) {
  console.log("SESSION STORE ERROR");
});

const sessionConfig = {
  store,
  name: "session",
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure: true,
    expires: Date.now() * 1000 * 60 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.engine("ejs", engine);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(session(sessionConfig));
console.log(session);
app.use(flash());

// By default, $ and . characters are removed completely from user-supplied input in the following places:
// - req.bodypp
// - req.params
// - req.headers
// - req.query
app.use(mongoSanitize());

app.use(passport.initialize());
app.use(passport.session());
//------------------some Configurations before using passport --------------------------
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
//--------------------------------------------------------------------------------------
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.use("/campgrounds", campgroundRoute);
app.use("/campgrounds/:id/review", reviewRoute);
app.use("/", userRoute);
app.use("/", indexRoute);

app.all("*", (req, res, next) => {
  throw new ExpressError("Page Not Found", 404);
});

app.use((err, req, res, next) => {
  const { message = "Oh no Something went wrong ", status = 404 } = err;
  res.status(status).render("error", { err });
});

const port = process.env.PORT || 3000;

app.listen(port, console.log(`Listening on port ${port}`));
