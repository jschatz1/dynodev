const Router = require("express");
const intakeController = require("./intake.controller");
const routes = new Router();

// POST /api/v1/cars
// GET /api/v1/cars/:id
// PUT /api/v1/cars/:id
// DELETE /api/v1/cars/:id
// GET /api/v1/cars

routes.post("/:username/:project/:model", intakeController.create);
routes.get("/:username/:project/:model/:id", intakeController.show);
routes.put("/:username/:project/:model/:id", intakeController.update);
routes.delete("/:username/:project/:model/:id", intakeController.destroy);
routes.get("/:username/:project/:model", intakeController.index);

module.exports = routes;
