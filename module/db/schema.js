const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * 注意数据库集合名一定要为复数
 * schema默认会在后面加s
 *
 * MongoDB可视化工具对于建立数据库连接也有影响
 * navicat 第一次连接要  七十多秒
 * 而robot3T 只需要二十多秒
 *
 *
 * 注意数据库里面有的一定要在这里进行添加
 * 不然无法处理
 */
let collection = {
  //创建对象属性，多集合
  /**
   * @用户
   */
  users: new Schema(
    {
      ObjectId: mongoose.Schema.Types.ObjectId,
      userName: { type: String, default: "" },
      nickName: { type: String, default: "" },
      password: { type: String },
      avatar: { type: String },
      colorTheme: { type: String },
      backgroundUrl: { type: String },
      access: { type: Array, default: ["user"] },
      sex: { type: Number },
      phone: { type: Number, default: null },
      email: { type: String, default: "" },
      address: { type: String, default: "" },
      token: { type: String }
    },
    {
      versionKey: false,
      index: true,
      timestamps: {
        createdAt: true,
        updatedAt: true
      }
    }
  ),
  /**
   * @项目
   */
  projects: new Schema(
    {
      ObjectId: mongoose.Schema.Types.ObjectId,
      user_id: mongoose.Schema.Types.ObjectId,
      projectName: String,
      remarks: {
        type: String
      },
      description:{
          type:String,
          default:''
      },
      collected: {
        type: Boolean,
        default: false
      },
      settingInfo: {
        type: Schema.Types.Mixed,
        default: {}
      }
      //待处理任务
    },
    {
      versionKey: false,
      index: true,
      timestamps: {
        createdAt: true,
        updatedAt: true
      }
    }
  ),
  /**
   * @仓库
   */
  knowledge: new Schema(
    {},
    {
      versionKey: false,
      index: true,
      timestamps: {
        createdAt: true,
        updatedAt: true
      }
    }
  ),
  /**
   *@表格
   */
  fields: new Schema(
    {},
    {
      versionKey: false,
      index: true,
      timestamps: {
        createdAt: true,
        updatedAt: true
      }
    }
  ),
  /**
   * @任务
   */
  todos: new Schema(
    {
      ObjectId: Schema.Types.ObjectId,
      user_id: Schema.Types.ObjectId,
      project_id: Schema.Types.ObjectId,
      name: {
        type: String
      },
      tags: { type: Array, default: [] },
      level: { type: Number, default: 2, min: 1, max: 4 }, //登机逆序，1 较低 2普通 3.较高 4。最高
      description: { type: String, default: "" },
      remarks: { type: String, default: "" }
    },
    {
      versionKey: false,
      index: true,
      timestamps: {
        createdAt: true,
        updatedAt: true
      }
    }
  ),
  /**
   * @日程
   */
  schedule: new Schema(
    {
        ObjectId:Schema.Types.ObjectId,
        project_id:Schema.Types.ObjectId,
        user_id:Schema.Types.ObjectId,
        parent_id:Schema.Types.ObjectId,
        name:{type:String,default:''},
        description:{type:String,default:''},
        startAt:{type:String,default:''},
        endAt:{type:String,default:''},
        notice:{type:Number,default:0},//提醒0为不提醒 1.日程开始时 2.提前5分钟 3.提前15分钟 。。。。。
        place:{type:String,default:''}
    },
    {
      versionKey: false,
      index: true,
      timestamps: {
        createdAt: true,
        updatedAt: true
      }
    }
  ),
  /**
   * @保险箱
   */
  cases: new Schema(
    {},
    {
      versionKey: false,
      index: true,
      timestamps: {
        createdAt: true,
        updatedAt: true
      }
    }
  )
};

module.exports = {
  collections: collection,
  users: mongoose.model("users", collection["users"]),
  projects: mongoose.model("projects", collection["projects"]),
  knowledge: mongoose.model("knowledge", collection["knowledge"]),
  schedule: mongoose.model("schedule", collection["schedule"]),
  todos: mongoose.model("todos", collection["todos"]),
  cases: mongoose.model("cases", collection["cases"])
};
