// const Joi = require("joi");
const Joi = require("@hapi/joi");

const updateOptionsSchema = Joi.object().keys({
  startRow: Joi.number().required().min(2),
  retries: Joi.bool().optional(),
});

// joi will attempt to convert start and numProducts to a string
const form = Joi.object({
  sheetName: Joi.string().optional().allow(""),
  sheetLink: Joi.string().required().uri(),
  merchant: Joi.string().valid("amazon").required(),
  template: Joi.string().valid("fbShops").required(),
  updateOptions: updateOptionsSchema,
  productsToUpdate: Joi.object({
    updateAll: Joi.bool().required(),
    numProducts: Joi.when("updateAll", {
      is: false,
      then: Joi.number()
        .required()
        .min(1)
        .max(100)
        .messages({ "number.min": "at least one update required" }),
    }),
  }),
});

module.exports = form;
