module.exports.isDev = process.env.NODE_ENV === "development";
module.exports.isTest = process.env.NODE_ENV === "test";
module.exports.isStaging = process.env.NODE_ENV === "staging";
module.exports.isProd = process.env.NODE_ENV === "production";