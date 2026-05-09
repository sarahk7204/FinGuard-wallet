const Joi = require("joi");

const categoryValidation = Joi.object({
  name: Joi.string().required(),
  type: Joi.string().required(),
});

module.exports = categoryValidation;