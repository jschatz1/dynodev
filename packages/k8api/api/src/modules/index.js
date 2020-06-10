const models = require("../models");
const namespacesRoutes = require("./namespaces/namespaces.routes");
const deploymentsRoutes = require("./deployments/deployments.routes");
const podsRoutes = require("./pods/pods.routes");

module.exports = function (app) {
  app.get("/api/v1/hello", function (req, res) {
    res.json({ msg: "hello there!" });
  });

  app.use("/api/v1/namespaces", namespacesRoutes);
  app.use("/api/v1/deployments", deploymentsRoutes);
  app.use("/api/v1/pods", podsRoutes);
};
