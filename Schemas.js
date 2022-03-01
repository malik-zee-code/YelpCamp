const BaseJoi = require("joi");
const sanitizeHTML = require("sanitize-html");

const extension = (joi) => {
  return ({
    type: "string",
    base: joi.string(),
    messages: {
      "string.escapeHTML": "{{#label}} must not include HTML!",
    },
    rules: {
      escapeHTML: {
        validate(value, helpers) {
          const clean = sanitizeHTML(value, {
            allowedTags: [],
            allowIframeRelativeUrls: {},
          });
          if (clean !== value)
            return helpers.error("string.escapeHTML", { value });
          return clean;
        },
      },
    },
  });
};

const Joi = BaseJoi.extend(extension);

module.exports.campgroundSchema = Joi.object({
  campground: Joi.object({
    title: Joi.string().required().escapeHTML(),
    price: Joi.number().required().min(0),
    discription: Joi.string().required().escapeHTML(),
    location: Joi.string().required().escapeHTML(),
  }).required(),
  deleteImage: Joi.array(),
});

module.exports.reviewSchema = Joi.object({
  reviews: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    body: Joi.string().required().escapeHTML(),
  }).required(),
});
