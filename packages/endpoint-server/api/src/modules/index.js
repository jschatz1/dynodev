const models = require("../models");
const intakeRoutes = require("./intake/intake.routes");
const intakeUtils = require("./intake/intake.utils");

module.exports = function (app) {
  app.get("/", function (req, res) {
    res.json({ msg: "go to /api/v1/hello" });
  });
  app.get("/api/v1/hello", function (req, res) {
    res.json({ msg: "hello there!" });
  });

  app.use("/api/v1", intakeRoutes);
};
