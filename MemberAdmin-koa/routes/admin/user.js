/*
 * @Author: AngelaEddie 
 * @Date: 2018-12-26 00:11:19 
 * @Last Modified by: AngelaEddie
 * @Last Modified time: 2019-01-04 04:57:46
 */

var router = require('koa-router')();

var DB = require('../../model/db.js');


var tools = require('../../model/tools.js');

router.get('/', async (ctx) => {

    var page=ctx.query.page ||1;

    var pageSize=12;

    //查询总数量

    var count= await  DB.count('user',{});
    var result=await DB.find('user',{},{},{
        page:page,
        pageSize:pageSize,
       
    });

    await ctx.render('admin/user/list', {

        list: result,
        page:page,
        totalPages:Math.ceil(count/pageSize)
    });
})


router.get('/add', async (ctx) => {
    var subjects = await DB.find('articlecate', { 'pid': '0' });
    await ctx.render('admin/user/add', {
        subjects: subjects
    });
    //console.log(subjects);
})

router.post('/doAdd', async (ctx) => {

    //1.获取表单提交的数据    console.log(ctx.request.body);

    //2.验证表单数据是否合法

    //3.在数据库查询当前要增加的管理员是否存在

    //4.增加管理员

    var username = ctx.request.body.username;
    var password = tools.randomWord(false, 6);
    var subjects = [];
    var last_time = tools.getTime();
    
    if(typeof(ctx.request.body.subjects) != 'string'){

        subjects = ctx.request.body.subjects;
    }else{

        subjects.push(ctx.request.body.subjects);
    }
    
    
    if (!/^\w{4,20}/.test(username)) {

        await ctx.render('admin/error', {
            message: '用户名不合法',
            redirect: ctx.state.__HOST__ + '/admin/user/add'
        })

    } else {

        //数据库查询当前用户是否存在

        var findResult = await DB.find('user', { "username": username });

        if (findResult.length > 0) {

            await ctx.render('admin/error', {
                message: '此用户名已经存在，请换个用户名',
                redirect: ctx.state.__HOST__ + '/admin/user/add'
            })

        } else {

            //增加用户
            var addResult = await DB.insert('user', { "username": username, "password": password, "subjects": subjects, "status": 1, "last_time": last_time });

            ctx.redirect(ctx.state.__HOST__ + '/admin/user');

        }


    }

})


router.get('/edit', async (ctx) => {

    var id = ctx.query.id;

    var result = await DB.find("user", { "_id": DB.getObjectId(id) });
    
    var subjects = await DB.find('articlecate', { 'pid': '0' });
    
    //console.log(result);
    //console.log(subjects );
    await ctx.render('admin/user/edit', {
        subjects: subjects,
        list: result[0]
    })

})

router.post('/doEdit', async (ctx) => {

    try {
        var requestUser = ctx.request.body;
        //console.log(ctx.request.body);
        var id = ctx.request.body.id;
        //var username = ctx.request.body.username;
        var password = ctx.request.body.password;
        var rpassword = ctx.request.body.rpassword;
        var qq=ctx.request.body.qq;
        var phone=ctx.request.body.phone;
        var email=ctx.request.body.email;
        var subjects=ctx.request.body.subjects;
        var json={
            password,qq,phone,email,subjects
        }
        var json2={

            qq,phone,email,subjects
        }
        if (password != '') {
            if (password != rpassword || password.length < 6) {

                await ctx.render('admin/error', {
                    message: '密码和确认密码不一致，或者密码长度小于6位',
                    redirect: ctx.state.__HOST__ + '/admin/user/edit?id=' + id
                })

            } else {

                //更新密码
                await DB.update('user', { "_id": DB.getObjectId(id) }, json);
                ctx.redirect(ctx.state.__HOST__ + '/admin/user');
            }
        } else {
            await DB.update('user', { "_id": DB.getObjectId(id) }, json2);
            ctx.redirect(ctx.state.__HOST__ + '/admin/user');
        }

    } catch (err) {
        await ctx.render('admin/error', {
            message: err,
            redirect: ctx.state.__HOST__ + '/admin/user/edit?id=' + id
        })

    }

})

router.get('/delete', async (ctx) => {

    ctx.body = "删除用户";

})

module.exports = router.routes();