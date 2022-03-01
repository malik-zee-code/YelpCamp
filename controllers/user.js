const User = require("../models/user");

module.exports.showRegister = (req, res) => {
  res.render("users/register");
};

module.exports.postRegister = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ username, email });
    const registered = await User.register(user, password);
    req.login(registered, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "Welcome To YelpCamp");
      res.redirect("/campgrounds");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/register");
  }
};

module.exports.showLogin = (req, res) => {
  res.render("users/login");
};

module.exports.postLogin = (req, res) => {
  req.flash("success", "Welcome Back");
  const redirect = req.session.returnTo || "/campgrounds";
  delete req.session.returnTo;
  res.redirect(`${redirect}`);
};

module.exports.logout = (req, res) => {
  req.logOut();
  req.flash("success", "GoodByeee!!!");
  res.redirect("/campgrounds");
};
