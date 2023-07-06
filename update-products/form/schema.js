const Joi = require("joi");

const updateOptionsSchema = Joi.object().keys({
  startRow: Joi.number().required().min(2),
  retries: Joi.bool().optional(),
});

// joi will attempt to convert start and numProducts to a string
const form = Joi.object({
  sheetName: Joi.string().optional(),
  sheetLink: Joi.string().required().uri(),
  merchant: Joi.string().valid("amazon", "walmart").required(),
  template: Joi.string().valid("fbShops").required(),
  updateOptions: updateOptionsSchema,
  productsToUpdate: Joi.object({
    numProducts: Joi.number().min(0).max(100),
    updateAll: Joi.bool(),
  }).or("numProducts", "updateAll"),
});

module.exports = form;
