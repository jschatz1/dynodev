const Router = require("express");
const podsController = require("./pods.controller");
const routes = new Router();

// POST /api/v1/pods
// GET /api/v1/pods/:id
// PUT /api/v1/pods/:id
// DELETE /api/v1/pods/:id
// GET /api/v1/pods

routes.post("/", podsController.create);
routes.get("/:id", podsController.show);
routes.put("/:id", podsController.update);
routes.delete("/:id", podsController.destroy);
routes.get("/", podsController.index);

module.exports = routes;
