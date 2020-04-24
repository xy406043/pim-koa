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
        // console.log("单例");
        resolve(_this.dbclient);
      }
    });
  }

  /**
   * @连写查询
   *@直接在find方法里写好options就行了
   */
  where(table, condition, options) {
    return new Promise((resolve, reject) => {
      this.connect()
        .then(() => {
          schema[table]
            .find(condition)
            .select(options.fields || "")
            .skip(options.skip || null)
            .sort(options.sort || {})
            .limit(options.limit || null)
            .exec((err, doc) => {
              if (err) {
                reject({ code: 1, err: err });
              } else {
                resolve({ code: 0, result: doc });
              }
            });
        })
        .catch(err => {
          console.log("错误：", err);
          reject({ code: 2, err: err });
        });
    });
  }
  where2(table, condition, options,populate) {
    return new Promise((resolve, reject) => {
      this.connect()
        .then(() => {
          schema[table]
            .find(condition)
            .select(options.fields || "")
            .skip(options.skip || null)
            .sort(options.sort || {})
            .limit(options.limit || null)
            .populate(populate || null)
            .exec((err, doc) => {
              if (err) {
                reject({ code: 1, err: err });
              } else {
                resolve({ code: 0, result: doc });
              }
            });
        })
        .catch(err => {
          console.log("错误：", err);
          reject({ code: 2, err: err });
        });
    });
  }
  where3(table, condition, options,aggregate) {
    console.log(aggregate)
    return new Promise((resolve, reject) => {
      this.connect()
        .then(() => {
          schema[table]
          .aggregate(aggregate || [])
            .exec((err, doc) => {
              if (err) {
                reject({ code: 1, err: err });
              } else {
                resolve({ code: 0, result: doc });
              }
            });
        })
        .catch(err => {
          console.log("错误：", err);
          reject({ code: 2, err: err });
        });
    });
  }

  /**
   * @mongoose获取数据库数据
   * @return {Array}
   */
  find(table, obj = {},fields,options) {
    return new Promise((resolve, reject) => {
      this.connect()
        .then(() => {
          schema[table].find(obj,fields,options, (err, doc) => {
            if (err) {
              reject({ code: 1, err: err });
            } else {
              resolve({ code: 0, result: doc });
            }
          });
        })
        .catch(err => {
          console.log("错误：", err);
          reject({ code: 2, err: err });
        });
    });
  }
  /**
   * @查找单个数据库数据
   * @return {Object}
   * @returns {null 查找}
   * @param {当前不用this.connect 是因为开始时创建实例时已经this.connect连接成功了，除非数据库意外关闭....那我还是加上this.connect吧}
   */
  findOne(table, obj = {},fields,options) {
    return new Promise((resolve, reject) => {
      this.connect()
        .then(() => {
          schema[table].findOne(obj,fields, options,(err, doc) => {
            if (err) {
              reject({ code: 1, err: err });
            } else {
              resolve({ code: 0, result: doc });
            }
          });
        })
        .catch(err => {
          console.log("错误：".err);
          reject({ code: 2, err: err });
        });
    });
  }
  /**
   * @根据ID查找
   * @param {*} table
   * @param {*} obj
   */
  findById(table, id,fields,options) {
    return new Promise((resolve, reject) => {
      this.connect()
        .then(() => {
          schema[table].findById(id,fields, options,(err, docs) => {
            if (err) {
              reject({ code: 1, err: err });
            } else {
              resolve({ code: 0, result: docs });
            }
          });
        })
        .catch(err => {
          console.log("错误：".err);
          reject({ code: 2, err: err });
        });
    });
  }

  /**
   * @向数据库插入数据
   * @return {}
   */
  insert(table, obj) {
    return new Promise((resolve, reject) => {
      this.connect()
        .then(() => {
          let ins = new schema[table](obj);
          ins.save((err, docs) => {
            //   console.timeEnd("time")
            if (err) {
              reject({ code: 1, err: err });
            } else {
              resolve({ code: 0, result: docs });
            }
          });
        })
        .catch(err => {
          console.log("错误：".err);
          reject({ code: 2, err: err });
        });
    });
  }
  /**
   * @向数据库更新一条数据
   * @return {}
   */
  updateOne(table, condition, options) {
    return new Promise((resolve, reject) => {
      this.connect()
        .then(() => {
          schema[table].updateOne(condition, options, (err, docs) => {
            if (err) {
              reject({ code: 1, err: err });
            } else {
              resolve({ code: 0, result: docs });
            }
          });
        })
        .catch(err => {
          console.log("错误：".err);
          reject({ code: 2, err: err });
        });
    });
  }
  /**
   * @向数据库更新数据
   * @return {}
   */
  updateMany(table, condition, options) {
    return new Promise((resolve, reject) => {
      this.connect()
        .then(() => {
          schema[table].updateMany(condition, options, (err, docs) => {
            if (err) {
              reject({ code: 1, err: err });
            } else {
              resolve({ code: 0, result: docs });
            }
          });
        })
        .catch(err => {
          console.log("错误：".err);
          reject({ code: 2, err: err });
        });
    });
  }
  /**
   * @根据ID查找并进行更行
   * @param {*} table
   * @param {*} id
   * @param {*} condition
   */
  findByIdAndUpdate(table, id, condition, options) {
    return new Promise((resolve, reject) => {
      this.connect()
        .then(() => {
          schema[table].findByIdAndUpdate(
            id,
            condition,
            options,
            (err, docs) => {
              if (err) {
                reject({ code: 1, err: err });
              } else {
                resolve({ code: 0, result: docs });
              }
            }
          );
        })
        .catch(err => {
          console.log("错误：".err);
          reject({ code: 2, err: err });
        });
    });
  }
  delete(table, condition) {
    return new Promise((resolve, reject) => {
      this.connect()
        .then(() => {
          schema[table].deleteMany(condition, (err, docs) => {
            if (err) {
              reject({ code: 1, err: err });
            } else {
              resolve({ code: 0, result: docs });
            }
          });
        })
        .catch(err => {
          console.log("错误：".err);
          reject({ code: 2, err: err });
        });
    });
  }
  /**
   * @根据ID进行删除
   * @param {*} table
   * @param {*} id
   * @param {*} condition
   */
  deleteById(table, id, condition) {
    return new Promise((resolve, reject) => {
      this.connect().then(() => {
        schema[table]
          .findByIdAndRemove(id, condition, (err, docs) => {
            if (err) {
              reject({ code: 1, err: err });
            } else {
              resolve({ code: 0, result: docs });
            }
          })
          .catch(err => {
            console.log("错误：".err);
            reject({ code: 2, err: err });
          });
      });
    });
  }
  /**
   * @计数
   */
  count(table, condition) {
    return new Promise((resolve, reject) => {
      this.connect().then(() => {
        schema[table]
          .countDocuments(condition, (err, docs) => {
            if (err) {
              reject({ code: 1, err: err });
            } else {
              resolve({ code: 0, result: docs });
            }
          })
          .catch(err => {
            console.log("错误：".err);
            reject({ code: 2, err: err });
          });
      });
    });
  }
  
    /**
     * @高级操纵封装关联
   * @关联查找aggregate 
   * @这是MongoDB写法不是schema写法
   * @params {options}
   */
  relateFind(table,options_list){
        return new Promise((resolve,reject)=>{
          this.connect().then(()=>{
            schema[table].aggregrate(options_list).exec((err,docs)=>{
              if(err){
                reject({code:1,err:err})
              }else{
                resolve({code:0,result:docs})
              }
            })
            .catch(error =>{
              console.log("错误：".err);
              reject({ code: 2, err: err });
            })
          })
        })
  }
  /** 
   * @populate查询
  */
  populateFind(table,condition={},fields,options,potion){
    return new Promise((resolve,reject)=>{
      this.connect().then(()=>{
        schema[table].find(condition,fields,options).populate(potion).exec((err,docs)=>{
          if(err){
            reject({code:1,err:err})
          }else{
            resolve({code:0,result:docs})
          }
        })
        .catch(error =>{
          console.log("错误：".err);
          reject({ code: 2, err: err });
        })
      })
    })
}
}

module.exports = Db.getInstance();
