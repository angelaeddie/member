/*
 * @Author: AngelaEddie 
 * @Date: 2018-12-28 11:31:24 
 * @Last Modified by: AngelaEddie
 * @Last Modified time: 2018-12-29 02:01:23
 */



var router = require('koa-router')();
var DB = require('../../model/db')

router.get('/',async (ctx)=>{

    var subjects = ctx.state.Gf.userLogin.subjects;
    var page=ctx.query.page ||1;

    var pageSize=10;

    //查询总数量

    var count= await  DB.count('article',{"catename":{$in:subjects},"status":1});
    var result=await DB.find('article',{"catename":{$in:subjects},"status":1},{},{
        page:page,
        pageSize:pageSize,
        sortJson:{
            'add_time':-1
        }
    });
    await  ctx.render('default/article/index',{
        list: result,
        page:page,
        totalPages:Math.ceil(count/pageSize)
    });
})

router.get('/detail',async (ctx)=>{
    var id=ctx.query.id;
    var result=await DB.find('article',{"_id":DB.getObjectId(id)});
    //console.log(result);
    await ctx.render('default/article/detail',{
        list: result[0]
    });
})




module.exports=router.routes();