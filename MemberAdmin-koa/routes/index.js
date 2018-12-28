/*
 * @Author: AngelaEddie 
 * @Date: 2018-12-28 21:41:56 
 * @Last Modified by:   AngelaEddie 
 * @Last Modified time: 2018-12-28 21:41:56 
 */
var router = require('koa-router')();
//引入模块
var url=require('url');
//配置中间件 获取url的地址
router.use(async (ctx,next)=>{
    //console.log(ctx.request.header.host);
    //模板引擎配置全局的变量
    ctx.state.__HOST__='http://'+ctx.request.header.host;
    //console.log(ctx.request.url);  //   /admin/user
    //  /admin/login/code?t=709.0399997523431
    var pathname=url.parse(ctx.request.url).pathname.substring(1);
    //左侧菜单选中
    var splitUrl=pathname.split('/');
    //console.log(splitUrl);
    //用户的ueserLogin
    ctx.state.Gf={
        url:splitUrl,
        userLogin:ctx.session.userLogin,
        prevPage:ctx.request.headers['referer']   /*上一页的地址*/
    }
    //await  next();
    // //权限判断
    //console.log(pathname);
    if(ctx.session.userLogin){
        //配置全局信息
        await  next();
    }else{  //没有登录跳转到登录页面
        if(pathname=='login' || pathname=='login/doLogin'  || pathname=='login/code'){
            await  next();
        }else{
            ctx.redirect('/login');
        }
    }
})
var index=require('./default/index.js');
var login=require('./default/login.js');
var user=require('./default/user.js');
var article=require('./default/article.js');

//前台首页
router.use(index);
router.use('/login',login);
router.use('/user',user);
router.use('/article',article);

module.exports=router.routes();