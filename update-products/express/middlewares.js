const publishUpdates = require("../wrapper");
const path = require("path");


function renderUserSpreadsheet(req, res) {
  res.render(path.join(__dirname, "../views/index"));
}

async function submitUpdates(req, res) {
  try {
    const msg = await publishUpdates(req.oAuth2Client, req.sheet, req.options);
    res.send({ msg }).status(200);
  } catch (error) {
    if (error.message) {
      res.status(500).send({ msg: error.message });
    } else {
      res.send(error).status(200);
    }
  }
}

module.exports = {renderUserSpreadsheet, submitUpdates};
