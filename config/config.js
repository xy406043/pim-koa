/**
 * 配置文件
 */

let app ={
    dbUrl : "mongodb://localhost:27017/",
    dbName:"xy-pim",
    redis:{
        get host(){
            return '127.0.0.1'
        },
        get port(){
            return 3000
        }
    },
    smtp: {
        get host() {
          return 'smtp.qq.com'
        },
        get user() {
          return '2507558229@qq.com'
        },
        // SMTP授权码
        get pass() {
          return 'txhczsvudlyxecbc'
        },
        get code() {
          return () => {
            return Math.random().toString(16).slice(2, 6).toUpperCase()
          }
        },
        get expire() {
          return () => {
            return new Date().getTime() + 60 * 1000
          }
        }
      }
}
module.exports=app