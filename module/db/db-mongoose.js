const mongo = require("mongoose"),
  schema = require("./schema"),
  config = require("../../config/config");
collections = schema.collections;

let dbName = config.dbName,
  dbUrl = config.dbUrl;
// mongo.set('useCreateIndx',true)

class Db {
  /**
   * 单例模式
   */
  static getInstance() {
    if (!Db.instance) {
      Db.instance = new Db();
    }
    return Db.instance;
  }

  constructor() {
    this.dbclient = null;
    this.connect(); // 内部直接建立持久化连接
  }

  /**
   * 建立数据库连接方式不一致
   * 与mongodb库的连接方式bu
   */
  connect() {
    let _this = this;
    return new Promise((resolve, reject) => {
      if (!_this.dbclient) {
        console.log("进入");
        _this.dbclient = mongo.connect(dbUrl + dbName, {
          useUnifiedTopology: true,
          useNewUrlParser: true
        });
        mongo.connection.on("connected", () => {
          console.log(`已成功连接到数据库 ${dbUrl + dbName}`);
          resolve(_this.dbclient);
        });
        mongo.connection.on("连接失败", err => {
          reject(err);
        });
      } else {
        console.log("单例");
        resolve(_this.dbclient);
      }
    });
  }

  /**
   * @mongoose获取数据库数据
   * @return {Array}
   */
  find(table, obj = {}) {
    return new Promise((resolve, reject) => {
      this.connect()
        .then(() => {
          schema[table].find(obj, (err, doc) => {
            if (err) {
              reject(err);
            } else {
              resolve(doc);
            }
          });
        })
        .catch(err => {
          console.log("错误：", err);
          reject(err)
        });
    });
  }
  /**
   * @查找单个数据库数据
   * @return {Object}
   * @returns {null 查找}
   * @param {当前不用this.connect 是因为开始时创建实例时已经this.connect连接成功了，除非数据库意外关闭....那我还是加上this.connect吧}
   */
  findOne(table, obj = {}) {
    return new Promise((resolve, reject) => {
      this.connect().then(() => {
        schema[table].findOne(obj, (err, doc) => {
          if (err) {
            reject(err);
          } else {
            resolve(doc);
          }
        });
      }).catch(err => {
        console.log("错误：".err)
        reject(err)
    })
    });
  }
  /**
   * @根据ID查找
   * @param {*} table 
   * @param {*} obj 
   */
  findById(table,id){
    return new Promise((resolve,reject)=>{
      this.connect().then(()=>{
        schema[table].findById(id,(err,doc)=>{
          if(err){
            reject(err)
          }else{
            resolve(doc)
          }
        })
      }).catch(err => {
        console.log("错误：".err)
        reject(err)
    })
    })
  }

  /**
   * @向数据库插入数据
   * @return {}
   */
  insert(table, obj) {
    return new Promise((resolve, reject) => {
      this.connect().then(() => {
        let ins = new schema[table](obj);
        ins.save((err, docs) => {
          //   console.timeEnd("time")
          if (err) {
            reject(err);
          } else {
            resolve(docs);
          }
        });
      }).catch(err => {
        console.log("错误：".err)
        reject(err)
    })
    });
  }
  /**
   * @向数据库更新数据
   * @return {}
   */
  updateOne(table, condition, doc) {
    return new Promise((resolve, reject) => {
        this.connect().then(() => {
            schema[table].updateOne(condition,doc,(err,docs) => {
                if(err){
                    reject(err)
                }else{
                    resolve(docs)
                }
            })

        }).catch(err => {
            console.log("错误：".err)
            reject(err)
        })
    });
  }
  /**
   * @根据ID进行删除
   * @param {*} table 
   * @param {*} id 
   * @param {*} condition 
   */
  deleteById(table,id,condition){
    return new Promise((resolve,reject)=>{
      this.connect().then(()=>{
        schema[table].findByIdAndRemove(id,condition,(err,docs)=>{
          if(err){
            reject(err)
        }else{
            resolve(docs)
        }
        }).catch(err => {
          console.log("错误：".err)
          reject(err)
      })
      })
    })
  }
}

module.exports = Db.getInstance();
