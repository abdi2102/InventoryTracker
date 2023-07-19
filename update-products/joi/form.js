const Joi = require("@hapi/joi");

const properties = Joi.array()
  .items(
    Joi.string().valid(
      "title",
      "description",
      "photos",
      "price",
      "quantity",
      "availability"
    )
  )
  .min(1)
  .messages({ "array.min": "at least one property must be selected" });

const updateForm = Joi.object({
  merchant: Joi.string().valid("amazon").required(),
  sheet: Joi.object({
    name: Joi.string().optional().allow(""),
    link: Joi.string().required().uri(),
    template: Joi.string().valid("fbShops").required(),
  }).required(),
  updateOptions: Joi.object().keys({
    startRow: Joi.number().required().min(2),
    retries: Joi.bool().optional(),
  }),
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
  properties,
});

const addForm = Joi.object({
  productIds: Joi.array().items(Joi.string().min(1)),
  properties,
});

module.exports = { addForm, updateForm };
