/**
 * Created by Administrator on 2018/3/21 0021.
 */
var md5 = require('md5');
//上传图片的模块
const multer = require('koa-multer');

let tools={
    multer(){  /*上传图片的配置*/
        var storage = multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, 'public/upload')
            },
            filename: function (req, file, cb) {
                var fileFormat = (file.originalname).split(".");   /*获取后缀名  分割数组*/
                cb(null,Date.now() + "." + fileFormat[fileFormat.length - 1]);
            }
        })
        var upload = multer({ storage: storage });
        return upload

    },
    getTime(){

        return new Date()
    },
    md5(str){
        return md5(str)
    },
    cateToList(data){


        //1、获取一级分类

        var firstArr=[];

        for(var i=0;i<data.length;i++){
            if(data[i].pid=='0'){
                firstArr.push(data[i]);
            }
        }
        //2、获取二级分类
        //console.log(firstArr);

        for(var i=0;i<firstArr.length;i++){

            firstArr[i].list=[];
            //遍历所有的数据  看那个数据的pid等于当前的数据_id
            for(var j=0;j<data.length;j++){
                if(firstArr[i]._id==data[j].pid){
                    firstArr[i].list.push(data[j]);
                }
            }

        }

        //console.log(firstArr);

        return firstArr;
    },
/*
** randomWord 产生任意长度随机字母数字组合
** randomFlag-是否任意长度 min-任意长度最小位[固定位数] max-任意长度最大位
** 生成3-32位随机串：randomWord(true, 3, 32)
** 生成43位随机串：randomWord(false, 43)
*/
randomWord(randomFlag, min, max){
    var str = "",
      range = min,
      arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n',  'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    // 随机产生
    if(randomFlag){
      range = Math.round(Math.random() * (max-min)) + min;
    }
    for(var i=0; i<range; i++){
      pos = Math.round(Math.random() * (arr.length-1));
      str += arr[pos];
    }
    return str;
  }
}

module.exports=tools;