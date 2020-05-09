module.exports.missingParams = function(res, fields) {
  return res.status(400).json({ msg: `missing fields: ${fields.join(",")}` });
}

module.exports.created = function(res, obj) {
  return res.json(obj);
}