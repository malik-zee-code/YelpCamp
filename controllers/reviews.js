const Review = require("../models/reviews");
const Campground = require("../models/campground");

module.exports.postReview = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id).populate("author");
  const review = new Review(req.body.reviews);
  review.author = req.user._id;
  campground.reviews.push(review);
  await campground.save();
  await review.save();
  req.flash("success", "Created a new Review");
  console.log(campground);
  console.log(req.body);
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteReview = async (req, res) => {
  const { id, reviewID } = req.params;
  await Campground.findByIdAndUpdate(id, {
    $pull: { reviews: reviewID },
  });
  await Review.findByIdAndDelete(reviewID);
  req.flash("success", "Successfully Deleted the review");
  res.redirect(`/campgrounds/${id}`);
};
