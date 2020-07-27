const Router = require("express");
const deploymentsController = require("./deployments.controller");
const routes = new Router();

// POST /api/v1/deployments
// GET /api/v1/deployments/:id
// PUT /api/v1/deployments/:id
// DELETE /api/v1/deployments/:id
// GET /api/v1/deployments

routes.post("/", deploymentsController.create);
routes.get("/:id", deploymentsController.show);
routes.put("/:id", deploymentsController.update);
routes.delete("/:id", deploymentsController.destroy);
routes.get("/", deploymentsController.index);

module.exports = routes;
