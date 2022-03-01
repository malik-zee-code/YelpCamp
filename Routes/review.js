const express = require("express");
const router = express.Router({ mergeParams: true });
const catchAsync = require("../Utils/catchAsync");
const { validateReview, isLoggedIn, isAuthorReview } = require("../middleware");
const review = require("../controllers/reviews");

router.post("/", isLoggedIn, validateReview, catchAsync(review.postReview));

router.delete(
  "/:reviewID",
  isLoggedIn,
  isAuthorReview,
  catchAsync(review.deleteReview)
);

module.exports = router;
