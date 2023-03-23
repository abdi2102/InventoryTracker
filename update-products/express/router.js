const { Router } = require("express");
const router = Router();
const { authorize } = require("../../auth/google");
const validateForm = require("../form/validate");
const {
  renderUserSpreadsheet,
  submitUpdates,
} = require("./middlewares");
router.use("/", authorize);

router.get("/", renderUserSpreadsheet);
router.patch("/update", validateForm, submitUpdates, globalErrorHandler);

function globalErrorHandler(req, res, next) {
  try {
    res.status(500).json({ msg: "Oops. Something Went Wrong." });
  } catch (error) {
    throw Error();
  }
}


module.exports = router;
