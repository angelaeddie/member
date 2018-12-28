/*
 * @Author: AngelaEddie 
 * @Date: 2018-12-28 21:41:11 
 * @Last Modified by: AngelaEddie
 * @Last Modified time: 2018-12-29 02:00:45
 */
var router = require('koa-router')();
const DB = require('../../model/db.js');
router.get('/', async (ctx) => {
  var subjects = ctx.state.Gf.userLogin.subjects;
 // console.log(subjects);
  var result = await DB.find('article', {"catename": {$in:subjects},"is_new":1,"status":1 }, {}, {
    sortJson: {
      'add_time': -1
    }
  });
 
  await ctx.render('default/index', {
    list: result
  });
})
module.exports = router.routes();  