/**
 * Created by Administrator on 2018/3/20 0020.
 */
var router = require('koa-router')();
var JWT = require('../model/jwt');
var cache = require('../model/cache')
var tools = require('../model/tools');
const CONFIG = require('../model/config');
router.get('/', async (ctx) => {
  ctx.body = "api接口";
});

router.get('/jwt', async (ctx) => {

  const token = JWT.signToken();

  ctx.body = {
    masg: '注册成功',
    data: { token: token }
  };
});

router.get('/vueAdminLogin', async (ctx) => {
  const ps = tools.md5(CONFIG.chatPassword);
  var count;
  if (!await cache.get('adminLogin_count')) {
    await cache.set('adminLogin_count', 5);
    count = 5;
  } else {
    count = await cache.get('adminLogin_count');
  }

  const password = ctx.query.password;
  //console.log(count)
  if (password == ps) {
    await cache.set('adminLogin_count', 5);//重置5次
    ctx.body = {
      masg: '登录成功',
      data: { res: "success" }
    };
  } else if (password != ps && count == 1) {
    //验证次数满

    ctx.body = {
      masg: '验证次数已满',
      data: { res: "ban" }
    };
  } else {
    // 密码错误，验证数没满
    count = await cache.get('adminLogin_count') - 1;
    await cache.set('adminLogin_count', count);
    //验证次数满
    ctx.body = {
      masg: '密码错误',
      data: { res: "faild" }
    };
  }

});

module.exports = router.routes();