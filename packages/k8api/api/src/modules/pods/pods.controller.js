const models = require("../../models");
const k8sApi = require("../../services/k8");

module.exports.create = async function create(req, res, next) {
  let pod;
  let reqBody = req.body;
  try {
    pod = await models.Pod.create({
      name: reqBody.name,
      DeploymentId: reqBody.DeploymentId,
      NamespaceId: reqBody.NamespaceId,
    });
  } catch (error) {
    console.trace("error", error);
  }

  res.json(pod);
};

module.exports.show = async function show(req, res, next) {
  const id = req.params.id;
  let pod = await models.Pod.findOne({
    where: {
      id,
    },
  });
  if (!pod) {
    return res.status(404).json({ msg: "not found" });
  } else {
    return res.json(pod);
  }
};

module.exports.update = async function update(req, res, next) {
  const id = req.params.id;
  let pod = await models.Pod.findOne({
    where: {
      id,
    },
  });

  if (!pod) {
    return res.status(404).json({ msg: "not found" });
  } else {
    pod.name = reqBody.name;
    pod.DeploymentId = reqBody.DeploymentId;
    pod.NamespaceId = reqBody.NamespaceId;
    let updated;
    try {
      updatedPod = await pod.save();
    } catch (error) {
      return res.status(422).json({ msg: "cannot save pod" });
    }
    return res.json(updatedPod);
  }
};

module.exports.destroy = async function destroy(req, res, next) {
  const id = req.params.id;
  try {
    let pod = await models.Pod.findOne({
      where: {
        id,
      },
    });
    if (!modelVariable) {
      return res.status(404).json({ msg: "not found" });
    }
    await pod.destroy();
  } catch (error) {
    return res.status(422).json({ msg: "cannot delete pod" });
  }
};

module.exports.index = async function index(req, res, next) {
  try {
    const k8res = await k8sApi.listNamespacedPod('ingress-nginx');
    return res.json(k8res.body);
  } catch (error) {
    console.trace(error);
    return res.status(422).json({ msg: "unable to get pods" });
  }
};
