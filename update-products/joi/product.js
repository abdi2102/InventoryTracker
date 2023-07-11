const Joi = require("@hapi/joi");

const productIdsSchema = Joi.array()
  .items(Joi.array().items(Joi.string().required()))
  .min(1);

module.exports = productIdsSchema;
