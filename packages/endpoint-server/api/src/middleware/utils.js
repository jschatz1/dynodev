function getRedisClient() {
  const redis = require("redis");
  const redisClient = redis.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    // password: process.env.REDIS_PASSWORD,
    no_ready_check: true,
  });
  return redisClient;
}

module.exports.getStore = function getStoreForEnv(session) {
  let store;
  const redisClient = getRedisClient();
  redisClient.on("error", function (err) {
    console.log("redis error: ", err);
  });
  const RedisStore = require("connect-redis")(session);
  store = new RedisStore({ client: redisClient });
  return store;
};