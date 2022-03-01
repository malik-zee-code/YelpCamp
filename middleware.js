const { campgroundSchema, reviewSchema } = require("./Schemas");
const Campground = require("./models/campground");
const Review = require("./models/reviews");
const ExpressError = require("./Utils/ExpressError");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash("error", "You have to signin First");
    return res.redirect("/login");
  }
  next();
};

module.exports.vlaidateSchema = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body); // Joi validations
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  }
  next();
};

module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground.author.equals(req.user._id)) {
    req.flash("error", "You are not the Author");
    return res.redirect(`/campgrounds/${campground.id}`);
  }
  next();
};
module.exports.isAuthorReview = async (req, res, next) => {
  const { id, reviewID } = req.params;
  const camp = await Campground.findById(id);
  const review = await Review.findById(reviewID);
  if (!review.author.equals(req.user._id)) {
    req.flash("error", "You are not the Author");
    return res.redirect(`/campgrounds/${camp.id}`);
  }
  next();
};

module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body); // Joi validations
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  }
  next();
};
