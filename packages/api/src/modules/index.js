const models = require("../models");

module.exports = function (app) {
  app.get("/api/v1/hello", function (req, res) {
    res.json({ msg: "hello there!" });
  });

  // app.use("/api/v1/users", userRoutes);
};
