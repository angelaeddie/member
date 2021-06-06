/*
 * @Author: AngelaEddie
 * @Date: 2018-12-26 00:11:19
 * @Last Modified by: AngelaEddie
 * @Last Modified time: 2018-12-28 21:44:28
 */

var router = require("koa-router")();

var DB = require("../../model/db.js");

router.get("/edit", async (ctx) => {
  var userLogin = ctx.state.Gf.userLogin;
  await ctx.render("default/user/edit", {
    userLogin: userLogin,
  });
  //console.log(subjects);
});

router.get("/editPW", async (ctx) => {
  var userLogin = ctx.state.Gf.userLogin;
  await ctx.render("default/user/editPW", {
    userLogin: userLogin,
  });
});
router.post("/doEdit", async (ctx) => {
  var username = ctx.request.body.username;
  //展示账号不能修改
  if (username == "tem8" || username == "cet4" || username == "cet6") {
    await ctx.render("default/error", {
      message: "没有权限",
      redirect: ctx.state.__HOST__,
    });
    return;
  }
  try {
    var id = ctx.request.body.id;
    //var username = ctx.request.body.username;
    //var password = ctx.request.body.password;
    //var rpassword = ctx.request.body.rpassword;
    var qq = ctx.request.body.qq;
    var phone = ctx.request.body.phone;
    var email = ctx.request.body.email;
    console.log(ctx.session.userLogin);
    //var subjects=ctx.request.body.subjects;
    var json = {
      qq,
      phone,
      email,
    };
    await DB.update("user", { _id: DB.getObjectId(id) }, json);
    ctx.session.userLogin.qq = qq;
    ctx.session.userLogin.phone = phone;
    ctx.session.userLogin.email = email;

    ctx.redirect(ctx.state.__HOST__);
  } catch (err) {
    await ctx.render("admin/error", {
      message: err,
      redirect: ctx.state.__HOST__ + "/user/editPW",
    });
  }
});

router.post("/doEditPW", async (ctx) => {
  var username = ctx.request.body.username;
    //展示账号不能修改
  if (username == "tem8" || username == "cet4" || username == "cet6") {
    await ctx.render("default/error", {
      message: "没有权限",
      redirect: ctx.state.__HOST__,
    });
    return;
  }
  try {
    var id = ctx.request.body.id;
    //var username=ctx.request.body.username;
    var password = ctx.request.body.password;
    var rpassword = ctx.request.body.rpassword;

    if (password != "") {
      if (password != rpassword || password.length < 6) {
        await ctx.render("default/error", {
          message: "密码和确认密码不一致，或者密码长度小于6位",
          redirect: ctx.state.__HOST__ + "/user/editPW",
        });
      } else {
        //更新密码
        await DB.update(
          "user",
          { _id: DB.getObjectId(id) },
          { password: password }
        );
        ctx.session.userLogin.password = password;
        // console.log(ctx.session.userLogin);
        await ctx.render("default/error", {
          message: "密码更新成功！请重新登陆！",
          redirect: ctx.state.__HOST__ + "/login/loginOut",
        });
      }
    } else {
      ctx.redirect(ctx.state.__HOST__);
    }
  } catch (err) {
    await ctx.render("admin/error", {
      message: err,
      redirect: ctx.state.__HOST__ + "/user/editPW",
    });
  }
});

module.exports = router.routes();
