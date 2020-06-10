const models = require("../../models");

module.exports.create = async function create(req, res, next) {
  let namespace;
  let reqBody = req.body;
  try {
    namespace = await models.Namespace.create({
      name: reqBody.name,
    });
  } catch (error) {
    console.trace("error", error);
  }

  res.json(namespace);
};

module.exports.show = async function show(req, res, next) {
  const id = req.params.id;
  let namespace = await models.Namespace.findOne({
    where: {
      id,
    },
  });
  if (!namespace) {
    return res.status(404).json({ msg: "not found" });
  } else {
    return res.json(namespace);
  }
};

module.exports.update = async function update(req, res, next) {
  const id = req.params.id;
  let namespace = await models.Namespace.findOne({
    where: {
      id,
    },
  });

  if (!namespace) {
    return res.status(404).json({ msg: "not found" });
  } else {
    namespace.name = reqBody.name;
    let updated;
    try {
      updatedNamespace = await namespace.save();
    } catch (error) {
      return res.status(422).json({ msg: "cannot save namespace" });
    }
    return res.json(updatedNamespace);
  }
};

module.exports.destroy = async function destroy(req, res, next) {
  const id = req.params.id;
  try {
    let namespace = await models.Namespace.findOne({
      where: {
        id,
      },
    });
    if (!modelVariable) {
      return res.status(404).json({ msg: "not found" });
    }
    await namespace.destroy();
  } catch (error) {
    return res.status(422).json({ msg: "cannot delete namespace" });
  }
};

module.exports.index = async function index(req, res, next) {
  try {
    let namespace = await models.Namespace.findAll();
    return res.json(namespace);
  } catch (error) {
    console.trace(error);
    return res.status(422).json({ msg: "unable to find namespace" });
  }
};
