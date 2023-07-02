const { Router } = require("express");
const router = Router();
const { auth } = require("../../auth/middleware");
const validateForm = require("../form/validate");
const {
  renderUserSpreadsheet,
  submitUpdates,
  stopUpdates,
} = require("./middlewares");
router.use("/", auth);

router.get("/", renderUserSpreadsheet);
router.patch("/update", validateForm, submitUpdates);
router.get("/updates/stop/", stopUpdates);
router.get;

module.exports = router;
