const Router = require("express");
const namespacesController = require("./namespaces.controller");
const routes = new Router();

// POST /api/v1/namespaces
// GET /api/v1/namespaces/:id
// PUT /api/v1/namespaces/:id
// DELETE /api/v1/namespaces/:id
// GET /api/v1/namespaces

routes.post("/", namespacesController.create);
routes.get("/:id", namespacesController.show);
routes.put("/:id", namespacesController.update);
routes.delete("/:id", namespacesController.destroy);
routes.get("/", namespacesController.index);

module.exports = routes;
