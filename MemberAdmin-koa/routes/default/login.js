/**
 * Created by Administrator on 2018/3/20 0020.
 */
const router = require('koa-router')();
const DB = require('../../model/db.js');

//验证码模块
var svgCaptcha = require('svg-captcha');
router.get('/', async (ctx) => {
    
    await ctx.render('./default/login');
})

//post
router.post('/doLogin', async (ctx) => {

    // console.log(ctx.request.body);  //{ username: 'admin', password: '123456' }

    //首先得去数据库匹配

    let username = ctx.request.body.username;

    let password = ctx.request.body.password;

    let code = ctx.request.body.code;

    //console.log(tools.md5(password));

    //1、验证用户名密码是否合法

    //2、去数据库匹配

    //3、成功以后把用户信息写入sessoin

    if (code.toLocaleLowerCase() == ctx.session.code.toLocaleLowerCase()) {

        //后台也要验证码用户名密码是否合法


        var result = await DB.find('user', { "username": username, "password": password, });
        if(result.length<=0){
            
                //console.log('失败');
                ctx.render('default/error', {
                    message: '用户名或者密码错误',
                    redirect: ctx.state.__HOST__ + '/login'
                })
            
        }
        else if (result.length > 0 && result[0].status == 1) {

            //console.log('成功');
            //console.log(result);

            ctx.session.userLogin = result[0];
            //更新用户表  改变用户登录的时间

            await DB.update('user', { "_id": DB.getObjectId(result[0]._id) }, {
                last_time: new Date()
            })

            ctx.redirect(ctx.state.__HOST__ + '/');
        } else {
            if (result[0].status == 0 || result[0].status == '0') {
                //console.log(result);
                result = [];
                ctx.render('default/error', {
                    message: '用户名状态锁定，请联系管理员。',
                    redirect: ctx.state.__HOST__ + '/login'
                })
            } 
        }
    } else {
        ctx.render('default/error', {
            message: '验证码失败',
            redirect: ctx.state.__HOST__ + '/login'
        })
    }

})

/*验证码*/
router.get('/code', async (ctx) => {
    //ctx.body='验证码';


    //加法的验证码
    //var captcha = svgCaptcha.createMathExpr({
    //    size:4,
    //    fontSize: 50,
    //    width: 100,
    //    height:40,
    //    background:"#cc9966"
    //});

    var captcha = svgCaptcha.create({
        size: 4,
        fontSize: 50,
        width: 120,
        height: 34,
        background: "#cc9966"
    });
    //console.log(captcha.text);

    //保存生成的验证码
    ctx.session.code = captcha.text;
    //设置响应头
    ctx.response.type = 'image/svg+xml';
    ctx.body = captcha.data;
})

router.get('/loginOut', async (ctx) => {
    ctx.session.userinfo=null;
    ctx.session.userLogin=null;
    ctx.redirect(ctx.state.__HOST__ + '/login');
})




module.exports = router.routes();