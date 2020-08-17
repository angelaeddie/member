var jwt = require('jsonwebtoken');
const CONFIG = require('./config');

let JWTsign = {
  signToken() {
   const token = jwt.sign({
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24),
      data: 'chat'
    }, CONFIG.secret);

    return token;
  },
  verifyToken(token, errCallback) {
    //验证jwt
    try {
      if (token) {
        var decode = jwt.verify(token, CONFIG.secret);
        return decode;
      } else {
        errCallback();
        return;
      }
    } catch (error) {
      errCallback();
      return;
    }
  }
}
module.exports = JWTsign;