const redis = require("redis");
const client = redis.createClient(
    process.env.REDIS_URL || { host: `localhost`, port: 6379 }
);

client.on("error", (err) => {
    console.log("error in redis", err);
});
