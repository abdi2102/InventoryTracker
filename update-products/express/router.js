const { Router } = require("express");
const router = Router();
const { authorize } = require("../../auth/google");
const validateForm = require("../form/validate");
const {
  renderUserSpreadsheet,
  submitUpdates,
  stopProductUpdates,
} = require("./middlewares");
router.use("/", authorize);

router.get("/", renderUserSpreadsheet);
router.patch("/update", validateForm, submitUpdates);
router.post("/stop/updates", stopProductUpdates);

module.exports = router;
