const mongo = require("mongodb").MongoClient;
let config = require("../../config/config.js");
let ObjectID = require("mongodb").ObjectID

class Db {
  //单例模式
  static getInstance() {
    if (!Db.instance) {
      Db.instance = new Db();
    }
    return Db.instance;
  }
  constructor() {
    this.dbClient = null; //放置DB对象     初始置null 比用 '' 还快
    this.connect();  //实例化的时候就连接数据库
  }
  //连接数据库
  connect() {
    let _this = this;
    return new Promise((resolve, reject) => {
      if (!this.dbClient) {      //解决数据库多次连接的问题
        console.log("开始")
        mongo.connect(
          config.dbUrl,
          { useUnifiedTopology: true },
          (err, client) => {
            if (err) {
              reject(err);
            } else {
              let db = client.db(config.dbName); //链接数据库
              _this.dbClient = db;
              resolve(_this.dbClient);
            }
          }
        );
      } else {
        console.log("确实");
        resolve(_this.dbClient);
      }
    });
  }

  //查
  find(collectionName, json) {
    return new Promise((resolve, reject) => {
      console.time("a")
      this.connect()
        .then(db => {
          let result = db.collection(collectionName).find(json); //查找集合
          result.toArray((err, docs) => {
            console.timeEnd("a")
            if (err) {
              reject(err);
            }
            resolve(docs);
          });
        })
        .catch(err => {
          console.log(err);
        });
    });
  }

  //只要一个

 //增
  insert(collectionName,json){
    let _this=this
    return new Promise((resolve,reject)=>{
      this.connect().then(db => {
        db.collection(collectionName).insertOne(json,(err,result)=>{
          if(err){
            reject(err)
          }else{
            resolve(result)
          }
        })
      })
    })

  }
 //改
  update(collectionName,json1,json2){
    let _this= this
    return new Promise((resolve,reject) => {
      this.connect().then(db => {
        db.collection(collectionName).updateOne(json1,{$set:json2},(err,result)=>{
          if(err){
            reject(err)
          }else{
            resolve(result)
          }
        })
      })
    })
  }

  //删
  remove(collectionName,json){
    let _this= this
    return new Promise((resolve,reject) => {
      this.connect().then(db => {
        db.collection(collectionName).removeOne(json,(err,result)=>{
          if(err){
            reject(err)
          }else{
            resolve(result)
          }
        })
      })
    })
  } 
  
  //MongoDB中_id
  getObjectId(id){
    return new ObjectID(id)
  }
}

//使用同一个实例化的对象！！！使用单例模式   只第一次链接耗时，之后操作数据只需要几毫秒

module.exports=Db.getInstance()