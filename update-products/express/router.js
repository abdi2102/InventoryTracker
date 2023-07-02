const { Router } = require("express");
const router = Router();
const validateForm = require("../form/validate");
const {
  renderUserSpreadsheet,
  submitUpdates,
  stopUpdates,
} = require("./middlewares");

router.get("/", renderUserSpreadsheet);
router.patch("/update", validateForm, submitUpdates);
router.get("/updates/stop/", stopUpdates);

module.exports = router;
