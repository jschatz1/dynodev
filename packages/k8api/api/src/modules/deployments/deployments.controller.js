const models = require("../../models");

module.exports.create = async function create(req, res, next) {
  let deployment;
  let reqBody = req.body;
  try {
    deployment = await models.Deployment.create({
      name: reqBody.name,
      NamespaceId: reqBody.NamespaceId,
    });
  } catch (error) {
    console.trace("error", error);
  }

  res.json(deployment);
};

module.exports.show = async function show(req, res, next) {
  const id = req.params.id;
  let deployment = await models.Deployment.findOne({
    where: {
      id,
    },
  });
  if (!deployment) {
    return res.status(404).json({ msg: "not found" });
  } else {
    return res.json(deployment);
  }
};

module.exports.update = async function update(req, res, next) {
  const id = req.params.id;
  let deployment = await models.Deployment.findOne({
    where: {
      id,
    },
  });

  if (!deployment) {
    return res.status(404).json({ msg: "not found" });
  } else {
    deployment.name = reqBody.name;
    deployment.NamespaceId = reqBody.NamespaceId;
    let updated;
    try {
      updatedDeployment = await deployment.save();
    } catch (error) {
      return res.status(422).json({ msg: "cannot save deployment" });
    }
    return res.json(updatedDeployment);
  }
};

module.exports.destroy = async function destroy(req, res, next) {
  const id = req.params.id;
  try {
    let deployment = await models.Deployment.findOne({
      where: {
        id,
      },
    });
    if (!modelVariable) {
      return res.status(404).json({ msg: "not found" });
    }
    await deployment.destroy();
  } catch (error) {
    return res.status(422).json({ msg: "cannot delete deployment" });
  }
};

module.exports.index = async function index(req, res, next) {
  try {
    let deployment = await models.Deployment.findAll();
    return res.json(deployment);
  } catch (error) {
    console.trace(error);
    return res.status(422).json({ msg: "unable to find deployment" });
  }
};
