const Router = require("express");
const projectsController = require("./projects.controller");
const modelsController = require("../models/models.controller");
const routes = new Router();

routes.post("/", projectsController.create);
routes.get("/:uuid/models", modelsController.show);

module.exports = routes;
