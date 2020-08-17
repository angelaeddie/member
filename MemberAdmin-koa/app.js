//引入 koa模块

var Koa = require('koa'),
  router = require('koa-router')(),
  path = require('path'),
  render = require('koa-art-template'),
  static = require('koa-static'),
  session = require('koa-session'),
  sd = require('silly-datetime'),
  jsonp = require('koa-jsonp'),
  bodyParser = require('koa-bodyparser'),
  cors = require('koa2-cors'),
  http = require('http'),
  socket = require('socket.io');

const JWT = require('./model/jwt');
const cache = require('./model/cache');
//实例化
var app = new Koa();

//如果原来是用app.listen(3000);来启动服务，现在要改成用http来启动server
const server = http.createServer(app.callback());

//挂载socket
const io = socket(server);

// Attach the socket to the application

//配置jsonp的中间件
app.use(jsonp());
//json taken authorize
// app._io.use(socketioJwt.authorize({
//     secret: config.JWT_SECRET,
//     handshake: true
// }));
//允许跨越
app.use(cors());
/**
socket.emit()：向建立该连接的客户端发送消息
socket.on()：监听客户端发送信息
io.to(socketid).emit()：向指定客户端发送消息
socket.broadcast.emit()：向除去建立该连接的客户端的所有客户端广播
io.sockets.emit()：向所有客户端广播
 * 
 */
// 监听socket连接
io.on("connect", async (socket) => {
  const noCsMsg = "暂时没有客服在线，请联系QQ客服 QQ: 857009534  /  810667822 或者访问 <a href='http://cet-pass.cn'>cet-pass.cn</a>";
  const query = socket.handshake.query;
  const id = socket.id;
  // console.log(id);//所有在线 socket集合
  const { room, token, type } = query;
  const ip = socket.handshake.address.replace("::ffff:", "");

  //管理员通道
  if (type == "server") {
    cache.set('cs_id', id);
    //客服断开连接，清空redis
    socket.on("disconnect", (msg) => {
      console.log("#disconnect_server", msg + "客服端id:[" + id + "],断开连接");
      cache.del('cs_id');
      //向房间广播客服断线
      io.of('/').to('CLIENT').emit('sever_disconnect', "客服已断开连接...")
    });
    socket.join(room)
    // 房间SERVER 所有 socket id
    io.of('/').adapter.clients([room], (err, clients) => {
      console.log("客服端id: " + JSON.stringify(clients));
    });
    // 房间CLIENT 所有 socket id  连接时 CLIENT 还有人
    io.of('/').adapter.clients(['CLIENT'], (err, clients) => {
      socket.emit('client_Reconnect', { clients });
      console.log("客户端id: " + JSON.stringify(clients));
    });
    // 所有已经连接 客户端 socket id
    // io.of('/').adapter.clients((err, clients) => {
    //   console.log(JSON.stringify(clients));
    // });
    // 客服端请求 客护id data:cs_id
    // socket.on('refreshClients_id', async (data) => {
    //   socket.emit('refreshClients_id', { clients_id });
    // });

  } else {
    //验证jwt
    var decode = JWT.verifyToken(token, () => {
      //  console.log("illegal token!");
      socket.emit("Illegal", "非法连接...")
      console.log("Illegal!")
      socket.disconnect();    //断开当前连接
      return;
    });
    //刷新客户列表
    //客户通道
    if (await cache.get('cs_id')) {
      socket.join(room);
      // 告诉SERVER 端 客户进房间
      io.to(await cache.get('cs_id')).emit('client_Connect', { client_id: id, ip, conDate: Date.now() });
      io.to(id).emit("exchange", { cs_id: await cache.get('cs_id'), msg: "亲，请问有什么帮到你呢？", data: Date.now() });

    } else {
      io.to(id).emit("system_reply", { msg: noCsMsg, data: Date.now() });
      //socket.disconnect(); //没有客服断开连接
    }
    //客户断开联系
    socket.on("disconnect", async (msg) => {
      console.log("#disconnect_client", msg + "客戶端id:[" + id + "],断开连接");
      // 告诉SERVER 端 客户断开
      io.to(await cache.get('cs_id')).emit('client_Disconnect', { client_id: socket.id });

    });

  }
  //信息交换
  /**
   *  type:"client",
        cs_id:storage.get("cs_id"),
        msg:this.msgTOsend,
        date:date,
   */
  socket.on("exchange", async (data) => {
    //客户---> 客服
    if (data.type == 'client') {
      //console.log("exchange: "+data)
      if (await cache.get('cs_id')) {
        io.to(await cache.get('cs_id')).emit("exchange", {
          msg: data.msg,
          date: data.date,
          client_id: id,
          ip,
        })
      } else {
        // 客服掉綫
        io.to(id).emit("system_reply", {
          msg: noCsMsg,
          date: Date.now(),
        })
      }

    }
    if (data.type == 'server') {
      if (data.client_id) {
        io.to(data.client_id).emit("exchange", {
          type: "server",
          msg: data.msg,
          date: data.date,
        })
      } else {
        console.log("沒有此用戶")
      }
    }
  });
});


//配置post提交数据的中间件
app.use(bodyParser());

//配置session的中间件

app.keys = ['some secret hurr'];
const CONFIG = {
  key: 'koa:sess',
  maxAge: 864000,
  overwrite: true,
  httpOnly: true,
  signed: true,
  rolling: true,   /*每次请求都重新设置session*/
  renew: false,
};
app.use(session(CONFIG, app));

//配置模板引擎
render(app, {
  root: path.join(__dirname, 'views'),
  extname: '.html',
  debug: process.env.NODE_ENV !== 'production',
  dateFormat: dateFormat = function (value) {
    return sd.format(value, 'YYYY-MM-DD HH:mm');
  } /*扩展模板里面的方法*/
});

//public/upload/1525251917221.png
//配置中间件

//app.use(static('.'));   不安全

//配置 静态资源的中间件
app.use(static(__dirname + '/public'));

//引入模块
var index = require('./routes/index.js');
var api = require('./routes/api.js');
var admin = require('./routes/admin.js');
const { join } = require('path');

router.use('/admin', admin);
router.use('/api', api);
router.use(index);
app.use(router.routes());   /*启动路由*/
app.use(router.allowedMethods());

server.listen(8008);









