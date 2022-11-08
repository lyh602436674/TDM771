/*
 * @Author: 陈乾龙
 * @Date: 2021-07-26 11:28:38
 * @LastEditTime: 2021-11-16 11:23:11
 * @LastEditors: 赵峰
 * @Description: 部署脚本
 * @FilePath: \hifar-platform-client\deploy_physics.js
 */
var Client = require('ssh2').Client;
var scp2 = require("scp2")

var host = {
  "debug": function (err) {
    console.log(err);
  },
  "host": "192.168.3.241",
  "port": 22,
  "username": "root",
  "password": "Hifar@1801",
  "readyTimeout": 100000,
  "algorithms": {
    "kex": ["diffie-hellman-group1-sha1"],
    "cipher": ["aes128-cbc"]
  }
};

var conn = new Client();
conn.on('ready', function () {
  console.log('ready ==================================');

  conn.exec("rm -rf /opt/physics/web",
    function (err, stream) {
      if (err) throw err;

      stream.on('close', function (code, signal) {
        console.log("删除成功,开始上传文件");

        scp2.scp("./dist", {
          "host": "192.168.3.241",
          "port": 22,
          "username": "root",
          "password": "Hifar@1801",
          "readyTimeout": 100000,
          "algorithms": {
            "kex": ["diffie-hellman-group1-sha1"],
            "cipher": ["aes128-cbc"]
          },
          path: "/opt/physics/web"
        }, function (err) {
          if (err) {
            console.log("上传失败.");
            console.log(err);
          } else {
            console.log("上传成功.");
            conn.end();
            conn.end();
          }
        })

      }).on('data', function (data) {
        console.log("数据");
      });

    }
  )
}).on("error", function (err) {
  console.log("error =========================" + err);
}).connect(host);