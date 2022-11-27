const Joi = require("joi");

// joi will attempt to convert start and numProducts to a string
const form = Joi.object({
  startRow: Joi.number().required().min(2),
  numProducts: Joi.number().required().min(1).max(50),
  sheetName: Joi.string().required(),
  sheetLink: Joi.string().required().uri(),
});
module.exports = form;
