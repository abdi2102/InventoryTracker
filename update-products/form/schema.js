const Joi = require("joi");

// joi will attempt to convert start and numProducts to a string
const form = Joi.object({
  startRow: Joi.number().required().min(2),
  numProducts: Joi.number().required().min(1).max(100),
  sheetName: Joi.string().optional(),
  sheetLink: Joi.string().required().uri(),
  merchant: Joi.string().valid("amazon", "walmart").required(),
  template: Joi.string().valid("fbShops").required(),
  custom: Joi.object().optional(),
});

module.exports = form;
