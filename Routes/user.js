const express = require("express");
const passport = require("passport");
const router = express.Router();
const catchAsync = require("../Utils/catchAsync");
const user = require("../controllers/user");

router
  .route("/register")
  .get(user.showRegister)
  .post(catchAsync(user.postRegister));

router
  .route("/login")
  .get(user.showLogin)
  .post(
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login",
    }),
    user.postLogin
  );

router.get("/logout", user.logout);

module.exports = router;
