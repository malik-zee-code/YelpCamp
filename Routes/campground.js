const express = require("express");
const router = express.Router();
const catchAsync = require("../Utils/catchAsync");
const { isLoggedIn, vlaidateSchema, isAuthor } = require("../middleware");
const campground = require("../controllers/campground");
const multer = require("multer");
const { storage } = require("../Cloudinary");
const upload = multer({ storage });

router.get("/new", isLoggedIn, campground.showNewCamp);

router
  .route("/")
  .get(campground.show)
  .post(
    isLoggedIn,
    upload.array("image"),
    vlaidateSchema,
    catchAsync(campground.createCamp)
  );

router
  .route("/:id")
  .get(campground.getCamp)
  .put(
    isLoggedIn,
    isAuthor,
    upload.array("image"),
    vlaidateSchema,
    catchAsync(campground.updateCamp)
  )
  .delete(isLoggedIn, isAuthor, catchAsync(campground.deleteCamp));

router.get("/:id/edit", isLoggedIn, isAuthor, campground.getEditCamp);
module.exports = router;
