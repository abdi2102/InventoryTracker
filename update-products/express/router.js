const { Router } = require("express");
const router = Router();
const { authorize } = require("../../auth/google");
const validateForm = require("../../form/validate");
const { renderUserSpreadsheet, submitUpdates } = require("./middlewares");
router.use("/", authorize);


router.get("/", renderUserSpreadsheet);
router.patch("/", validateForm, submitUpdates);

module.exports = router;
