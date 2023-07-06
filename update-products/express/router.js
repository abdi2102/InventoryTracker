const { Router } = require("express");
const router = Router();
const {
  renderUserSpreadsheet,
  submitUpdates,
  stopUpdates,
} = require("./middlewares");

router.get("/", renderUserSpreadsheet);
router.patch("/update", submitUpdates);
router.get("/updates/stop/", stopUpdates);

module.exports = router;
