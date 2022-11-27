const express = require("express");
const router = express.Router();
const { authorize } = require("./auth");
const validateForm = require("../backend/validate-form");
const publishUpdates = require("../backend/publish-updates");

router.use("/", authorize);

function renderUserSpreadsheet(req, res) {
  res.render("../views/index");
}

async function submitUpdates(req, res) {
  try {
    const msg = await publishUpdates(req.oAuth2Client, req.sheet, req.options);
    res.send({ msg }).status(200);
  } catch (error) {
    console.log(error);
    if (error.message) {
      res.status(500).send({ msg: error.message });
    } else {
      res.send(error).status(200);
    }
  }
}

router.get("/", renderUserSpreadsheet);
router.patch("/", validateForm, submitUpdates);
module.exports = router;
