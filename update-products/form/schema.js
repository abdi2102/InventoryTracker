const Joi = require("@hapi/joi");

const updateOptionsSchema = Joi.object().keys({
  startRow: Joi.number().required().min(2),
  retries: Joi.bool().optional(),
});

const form = Joi.object({
  merchant: Joi.string().valid("amazon").required(),
  sheet: Joi.object({
    name: Joi.string().optional().allow(""),
    link: Joi.string().required().uri(),
    template: Joi.string().valid("fbShops").required(),
  }).required(),
  updateOptions: updateOptionsSchema,
  productsToUpdate: Joi.object({
    updateAll: Joi.bool().default(false),
    numProducts: Joi.when("updateAll", {
      is: false,
      then: Joi.number().required().min(1).max(100).messages({
        "number.min": "at least one update required",
        "number.max": "max. updates is 100",
      }),
    }),
  }),
  properties: Joi.array().allow("price", "quantity", "availability").optional()
});

module.exports = form;
