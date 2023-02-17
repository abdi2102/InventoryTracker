const Joi = require("joi");

// joi will attempt to convert start and numProducts to a string
const form = Joi.object({
  startRow: Joi.number().required().min(2),
  numProducts: Joi.number().required().min(0).max(100),
  sheetName: Joi.string().optional(),
  sheetLink: Joi.string().required().uri(),
  retries: Joi.bool().required(),
  updateAll: Joi.bool().required(),
});

module.exports = form;
