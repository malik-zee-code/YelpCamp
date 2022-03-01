const Campground = require("../models/campground");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mbxToken = process.env.MAPBOX_TOKEN;
const geocode = mbxGeocoding({ accessToken: mbxToken });
const { cloudinary } = require("../Cloudinary");

module.exports.show = async (req, res, next) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/home", { campgrounds });
};

module.exports.showNewCamp = (req, res) => {
  res.render("campgrounds/newCamp");
};

module.exports.createCamp = async (req, res, next) => {
  const geodata = await geocode
    .forwardGeocode({
      query: req.body.campground.location,
      limit: 1,
    })
    .send();
  const campground = new Campground(req.body.campground);
  campground.geometry = geodata.body.features[0].geometry;
  campground.image = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  campground.author = req.user._id;
  await campground.save();
  console.log(campground);
  req.flash("success", "Successfully Created a new Campground");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.getEditCamp = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground) {
    req.flash("error", "No page Found");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/edit", { campground });
};

module.exports.updateCamp = async (req, res) => {
  const { id } = req.params;
  console.log(req.body);
  const campground = await Campground.findByIdAndUpdate(id, {
    ...req.body.campground,
  });
  const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
  campground.image.push(...imgs);
  await campground.save();
  if (req.body.deleteImage) {
    for (let filename of req.body.deleteImage) {
      await cloudinary.uploader.destroy(filename);
    }
    await campground.updateOne({
      $pull: { image: { filename: { $in: req.body.deleteImage } } },
    });
    console.log("i am hereeeee");
  }
  req.flash("success", "Successfully Updated a Campground");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.getCamp = async (req, res) => {
  const campground = await Campground.findById(req.params.id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("author");
  if (!campground) {
    req.flash("error", "No page Found");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/show", { campground });
};

module.exports.deleteCamp = async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  req.flash("success", "Successfully Deleted a Campground");
  res.redirect("/campgrounds");
};
