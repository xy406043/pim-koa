const mongoose = require("mongoose");
const Schema = mongoose.Schema;
mongoose.set("useFindAndModify", false);
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
      secondCode:{type:String,default:""}, //二级密码
      colorTheme: { type: String },
      backgroundUrl: { type: String },
      access: { type: Array, default: ["user"] },
      sex: { type: Number },
      birthDate:String,
      nativePlace:Schema.Types.Mixed,
      realName:String,
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
   * @验证信息存储
   * @用以用户登录注册
   */
  verify: new Schema(
    {
      ObjectId: mongoose.Schema.Types.ObjectId,
      userName:String,
      email:String,
      code:String,
      expire:Number,
      user_id:Schema.Types.ObjectId
    },
    {
      versionKey: false,
      index: true,
      collection: "verify",
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
      description: {
        type: String,
        default: ""
      },
      collected: {
        type: Boolean,
        default: false
      },
      tags: {
        type: Array,
        default: [
          { value: "需求", color: "skyblue" },
          { value: "问题", color: "red" },
          { value: "待检验", color: "orange" },
          { value: "处理中", color: "green" }
        ]
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
   * @任务
   */
  todos: new Schema(
    {
      ObjectId: Schema.Types.ObjectId,
      user_id: Schema.Types.ObjectId,
      project_id: Schema.Types.ObjectId,
      list_id: Schema.Types.ObjectId,
      parent_todo: Schema.Types.ObjectId,
      name: { type: String },
      tags: { type: Array, default: [] },
      level: { type: Number, default: 2, min: 1, max: 4 }, //登机逆序，1 较低 2普通 3.较高 4。最高
      description: { type: String, default: "" },
      remarks: { type: String, default: "" },
      startAt: { type: Date },
      endAt: { type: Date },
      finishedAt:{type:Date},//任务完成时间
      status: { type: Number, default: 1 }, // 1.待开始 2. 进行中 3暂停中 4.已结束,
      finished: { type: Boolean, default: false },
      collected: { type: Boolean, default: false }
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
   * @任务清单
   */
  todolist: new Schema(
    {
      ObjectId: Schema.Types.ObjectId,
      project_id: Schema.Types.ObjectId,
      user_id:Schema.Types.ObjectId,
      name: String,
      description: { type: String, default: "" },
      archived: { type: Boolean, default: false },
      collected: { type: Boolean, default: false }
    },
    {
      versionKey: false,
      index: true,
      collection: "todolist",
      timestamps: {
        createdAt: true,
        updatedAt: true
      }
    }
  ),
  // /**
  //  * @知识库
  //  * 现在根据集体划分
  //  */
  // knowledge: new Schema(
  //   {
  //     ObjectId:Schema.Types.ObjectId,
  //     collected:{type:Boolean,default:false}
  //   },
  //   {
  //     versionKey: false,
  //     index: true,
  //     collection:'todolist',
  //     timestamps: {
  //       createdAt: true,
  //       updatedAt: true
  //     }
  //   }
  // ),
  /**
   * @日记
   */
  notes: new Schema(
    {
      ObjectId: Schema.Types.ObjectId,
      user_id: Schema.Types.ObjectId,
      title: { type: String, default: "" },
      content: { type: String, default: "" },
      group_id:Schema.Types.ObjectId

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
   * @账单
   */
  bill: new Schema(
    {
      ObjectId: Schema.Types.ObjectId,
      user_id: Schema.Types.ObjectId,
      title: { type: String, default: "" }
    },
    {
      versionKey: false,
      collection: "bill",
      index: true,
      timestamps: {
        createdAt: true,
        updatedAt: true
      }
    }
  ),
  /**
   * @网址收藏
   */
  bookmarkings: new Schema(
    {
      ObjectId: Schema.Types.ObjectId,
      user_id: Schema.Types.ObjectId,
      group_id: Schema.Types.ObjectId,
      title: { type: String, default: "" },
      url: { type: String, default: "" },
      imgUrl: { type: String, default: "" }
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
   * @通用分组
   */
  group: new Schema(
    {
      ObjectId: Schema.Types.ObjectId,
      user_id: Schema.Types.ObjectId,
      name: { type: String },
      description: { type: String },
      groupType: { type: Number }   // 2为 网址收藏  1 为 日记本
    },
    {
      versionKey: false,
      index: true,
      collection: "group",
      timestamps: {
        createdAt: true,
        updatedAt: true
      }
    }
  ),

  /**
   * @通讯录
   */
  addressBooks: new Schema(
    {
      ObjectId: Schema.Types.ObjectId,
      user_id: Schema.Types.ObjectId,
      group_id: Schema.Types.ObjectId,
      name: { type: String, default: "" },
      qq:{type:String},
      interest:{type:String},
      mailAddress:{type:String},
      phoneList: { type: Array, default: [] },
      emailList: { type: Array, default: [] },
      groupName: { type: String }
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
   * @便签
   */
  label: new Schema(
    {
      ObjectId: Schema.Types.ObjectId,
      user_id: Schema.Types.ObjectId,
      title: { type: String, default: "" }
    },
    {
      versionKey: false,
      index: true,
      collection: "label",
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
    {
      ObjectId: Schema.Types.ObjectId,
      user_id: Schema.Types.ObjectId,
      collected: { type: Boolean, default: false }
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
      ObjectId: Schema.Types.ObjectId,
      project_id: Schema.Types.ObjectId,
      user_id: Schema.Types.ObjectId,
      title: { type: String, default: "" },
      description: { type: String, default: "" },
      startAt: { type: Date },
      endAt: { type: Date },
      notice: { type: Number, default: 0 }, //提醒0为不提醒 1.日程开始时 2.提前5分钟 3.提前15分钟 。。。。。
      address: { type: String, default: "" },
      collected: { type: Boolean, default: false }
    },
    {
      versionKey: false,
      index: true,
      collection: "schedule",
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
    {
      ObjectId: Schema.Types.ObjectId,
      collected: { type: Boolean, default: false }
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
   * @密码本
   */
  codebook: new Schema(
    {
      ObjectId:Schema.Types.ObjectId,
      user_id:Schema.Types.ObjectId,
      affiliation:String, //账号 从属
      accountUrl:String,//账号Url
      accountList:Array,
      remarks:""    //备注

    },
    {
      versionKey: false,
      index: true,
      collection: "codebook",
      timestamps: {
        createdAt: true,
        updatedAt: true
      }
    }
  ),
  /**
   * @文件夹   
   * @只保存链接以及相关信息
   */
    folder: new Schema(
    {
      ObjectId:Schema.Types.ObjectId,
      user_id:Schema.Types.ObjectId,
      name:String,  //是文件的上传名，返回的链接就是这个
      type:String,
      size:Number,
      fileUrl:String,
      /**
       * @以下为任务集内容标识
       */
      showName:String,//展示的文件名
      project_id:Schema.Types.ObjectId

    },
    {
      versionKey: false,
      index: true,
      collection: "folder",
      timestamps: {
        createdAt: true,
        updatedAt: true
      }
    }
  ),
   /**
   * @网站右上角消息通知   
   * @如果有后台管理系统的话倒是可以发送通知
   * @但是目前仅有这个就没有必要了
   */
  notify: new Schema(
    {
      ObjectId:Schema.Types.ObjectId,
      user_id:Schema.Types.ObjectId,
      schedule_id:Schema.Types.ObjectId,
      todo_id:Schema.Types.ObjectId,
      title:String,
      content:String,
      sendTime:Date,
      read:{  //该通知是否已经被阅读
        type:Boolean,
        default:false
      }
    },
    {
      versionKey: false,
      index: true,
      collection: "notify",
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
  verify:mongoose.model("verify",collection["verify"]),
  projects: mongoose.model("projects", collection["projects"]),
  // knowledge: mongoose.model("knowledge", collection["knowledge"]),
  notes: mongoose.model("notes", collection["notes"]),
  bookmarkings: mongoose.model("bookmarkings", collection["bookmarkings"]),
  bill: mongoose.model("bill", collection["bill"]),
  group: mongoose.model("group", collection["group"]),
  addressBooks: mongoose.model("addressBooks", collection["addressBooks"]),
  label: mongoose.model("label", collection["label"]),
  schedule: mongoose.model("schedule", collection["schedule"]),
  todos: mongoose.model("todos", collection["todos"]),
  todolist: mongoose.model("todolist", collection["todolist"]),
  cases: mongoose.model("cases", collection["cases"]),
  codebook: mongoose.model("codebook", collection["codebook"]),
  folder: mongoose.model("folder", collection["folder"]),
  notify: mongoose.model("notify", collection["notify"]),
};
