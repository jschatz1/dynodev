const Router = require("express");
const projectsController = require("./projects.controller");
const routes = new Router();

routes.post("/", projectsController.create);

module.exports = routes;
