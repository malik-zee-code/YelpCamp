const mongoose = require("mongoose");
const Review = require("./reviews");
const Schema = mongoose.Schema;
const opts = { toJSON: { virtuals: true } };
const imageSchema = new Schema({
  url: String,
  filename: String,
});

imageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200");
});

const CampgroundSchema = new Schema(
  {
    geometry: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    location: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    image: [imageSchema],
    discription: {
      type: String,
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  opts
);

CampgroundSchema.post("findOneAndDelete", async (doc) => {
  // for deleting reviews in the review collection when a Campground is deleted it then
  // also deletes the reviews
  if (doc) {
    await Review.deleteMany({ _id: { $in: doc.reviews } });
    console.log("Deleted");
  }
});

CampgroundSchema.virtual("properties.popUpMarkup").get(function () {
  return ` <strong>
  <a href='/campgrounds/${this._id}'>${this.title}</a>
  </strong> <p>${this.discription.substring(0,30)}...</p>`;
});

module.exports = mongoose.model("Campground", CampgroundSchema);
