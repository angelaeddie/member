const Redis = require('ioredis');

const redis = new Redis();

let cache = {
  async set(key, value, seconds) {
    if (redis) {          //判断是否开启redis中间件
      value = JSON.stringify(value);
      if (!seconds) {
        await redis.set(key, value);
      } else {
        await redis.set(key, value, "EX", seconds);
      }
    }
    return;
  },

  async get(key) {
    if (redis) {
      var data = await redis.get(key);
      if (!data) return;
      return JSON.parse(data);
    }
    return;
  },

  // 清空redis
  async flushall() {
    redis.flushall();
    return;
  },

  //删除
  async del(key) {
    await redis.del(key);
    return
  }


}
module.exports = cache;