const { Router } = require("express");
const router = Router();
const { authorize } = require("../../auth/google");
const validateForm = require("../form/validate");
const {
  renderUserSpreadsheet,
  submitUpdates,
  stopUpdates,
} = require("./middlewares");
// const { error } = require("../form/schema");
router.use("/", authorize);

router.get("/", renderUserSpreadsheet);
router.patch("/update", validateForm, submitUpdates, globalErrorHandler);
router.get("/updates/stop/", stopUpdates);

function globalErrorHandler(req, res, next) {
  try {
    const { code: errorCode, msg: errorMessage } =
      req.res.locals.submitUpdatesError;

    if (errorMessage) {
      res.status(errorCode).json({ msg: errorMessage });
    } else {
      res.status(200).json({ msg: "Attempting to update. Check back later." });
    }
  } catch (error) {
    console.log("error");
    res.status(500).json({ msg: error });
  }
}

module.exports = router;
