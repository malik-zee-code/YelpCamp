const mongoose = require("mongoose");
const Campground = require("../models/campground");
const { descriptors } = require("./seedHelpers");
const { places } = require("./seedHelpers");
const cities = require("./cities");

mongoose.connect("mongodb://localhost:27017/yelp-camp");

const db = mongoose.connection;
db.on("error", console.error.bind("connection errror:"));
db.once("open", () => {
  console.log("Database Opened");
});

const seedAr = (arr) => {
  return Math.floor(Math.random() * arr.length);
};
const fetch = () => {
  fetch("https://source.unsplash.com/random/in-the-woods").then(
    (res) => res.url
  );
};

const seedDB = async () => {
  await Campground.deleteMany({});

  for (let i = 0; i < 300; i++) {
    const randomn = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      author: "6213823202a9edeb86c30a8d",
      location: `${cities[randomn].city}, ${cities[randomn].state}`,
      title: `${descriptors[seedAr(descriptors)]} ${places[seedAr(places)]}`,
      discription:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Accusantium corrupti ipsam aliquid nisi. Nulla vitae hic enim necessitatibus deleniti pariatur, mollitia magni debitis sequi labore excepturi reprehenderit illum, perferendis nobis.Nam voluptates esse ad odio expedita accusantium aperiam vel nostrum! Fugit pariatur dolorum vitae non nihil architecto culpa perspiciatis ipsum quod, in labore corporis laboriosam consequatur optio dolor. Perferendis, quia!",
      price: price,
      image: [
        {
          url: "https://res.cloudinary.com/yelp-camp112/image/upload/v1646040721/YelpCamp/phvgfmaqznhv90hu0vv8.jpg",
          filename: "YelpCamp/phvgfmaqznhv90hu0vv8",
        },
        {
          url: "https://res.cloudinary.com/yelp-camp112/image/upload/v1646040721/YelpCamp/zsui4u4xrymdlxsthih5.jpg",
          filename: "YelpCamp/zsui4u4xrymdlxsthih5",
        },
      ],
      geometry: {
        type: "Point",
        coordinates: [cities[randomn].longitude, cities[randomn].latitude],
      },
    });
    await camp.save();
  }
};

seedDB().then(() => mongoose.connection.close());
