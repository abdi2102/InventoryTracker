const Joi = require("joi");

const updateOptionsSchema = Joi.object().keys({
  startRow: Joi.number().required().min(2),
  numProducts: Joi.number().required().min(1).max(100),
  retries: Joi.bool().optional(),
  updateAll: Joi.bool().optional()
});

// joi will attempt to convert start and numProducts to a string
const form = Joi.object({
  sheetName: Joi.string().optional(),
  sheetLink: Joi.string().required().uri(),
  merchant: Joi.string().valid("amazon", "walmart").required(),
  template: Joi.string().valid("fbShops").required(),
  updateOptions: updateOptionsSchema,
});

module.exports = form;
