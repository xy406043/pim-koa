const DB=require("../db/db-mongoose")
const jwt = require("jsonwebtoken");
const User = require("../../libs/user");
const moment =require("moment")

const checkType =(val)=>{
    switch(val){
        case 1:
            return  0
        case 2:
            return 5*60*1000
        case 3:
            return 15*60*1000
        case 4:
            return 30*60*1000
        case 5:
            return 60 *60*1000
        case 6:
            return 24*60*60*1000
    }
    
}
const getString = (val) =>{
   switch(val){
       case 1:
        return "现在开始"
       case 2:
        return "在5分钟之后开始"
       case 3:
           return "在10分钟之后开始"
        case 4:
            return "在30分钟之后开始"
        case 5:
            return "在一小时之后开始"
        case 6:
            return "一天后开始"
   }
}

const use= {
    /**
     * @发送日程开始通知
     */
    sendNotice: async(token)=>{
        /**
         * @此提醒为日程提醒
         */
    let payload = await jwt.verify(token,"PimToken")
    let user = await User.CheckUser(payload); // 牢记异步
    if(user){
        user_id=payload.id  //解析出用户ID
        // const timeList = []
        let condition={
            user_id:user_id,
            notice:{$ne:0}
        }
        let result =(await DB.find("schedule",condition)).result
        for(let item of result){

            let time =  (new Date(item.startAt).valueOf())-checkType(item.notice)
            // console.log("时间1", time -new Date().valueOf())
            if(Math.abs(time-new Date().valueOf())<=5*1000){
                //发出提醒
                let this_condition={
                    user_id:user_id,
                    schedule_id:item._id
                }
                let thisTime =(await DB.findOne("notify",this_condition)).result
                if(thisTime===null){
                    let p={
                        schedule_id:item._id,
                        sendTime: new Date(time),
                        title:item.title,
                        user_id:user_id,
                        content:"您的日程 ("+item.title+') '+getString(item.notice)
                    }
                    await DB.insert("notify",p)
                    let this_mail =(await DB.findOne("notify",this_condition)).result
                    console.log("您的消息提醒",this_mail)
                    return this_mail
                }else{
                    let notify_id =thisTime._id
                    let p={
                        sendTime: new Date(time),
                        title:item.title,
                        read:false,
                        content:"您的日程: ("+item.title+') '+getString(item.notice)
                    }
                    await DB.findByIdAndUpdate("notify",notify_id,p)
                    let this_mail =(await DB.findOne("notify",this_condition)).result
                    console.log("您的消息提醒",this_mail)
                    return this_mail
                }
            }else{
                // return 0
            }
        }
        return  0
    }
    },
    /**
     * @发送任务截止时间通知
     */
    sendTodoNotice: async (token) =>{
        let payload = await jwt.verify(token,"PimToken")
        let user = await User.CheckUser(payload); // 牢记异步
        if(user){
            user_id=payload.id  //解析出用户ID
            // const timeList = []
            let condition={
                user_id:user_id,
                endAt:{$exists:true,$ne:null},
                parent_todo:{$exists:false}
            }
           let options={
               sort:{endAt:-1}
           }

            let  result=(await DB.where("todos",condition,options)).result
            for(let item of result){
                let time =new Date(item.endAt).valueOf() - 10*60*1000
                // console.log(item.endAt,moment(item.endAt).format("YYYY-MM-DD HH:mm:ss"))
                // console.log("时间",time-new Date().valueOf())
                if(Math.abs(time-new Date().valueOf())<=5*1000){
                     let this_condition={
                         user_id:user_id,
                         todo_id:item._id
                     }
                     let thisTodo =(await DB.findOne("notify",this_condition)).result
                     console.log("??",thisTodo)
                     if(thisTodo===null){
                         let p={
                             user_id:user_id,
                             title:item.name,
                             todo_id:item._id,
                             sendTime:new Date(time),
                             content: '您的任务 ('+item.name+') 将在十分钟之后达到截止时间,请注意完成'
                         }
                         await DB.insert("notify",p)
                         let this_mail =(await DB.findOne("notify",this_condition)).result
                         console.log("您的消息提醒",this_mail)
                         return this_mail
                     }else{
                        let notify_id = thisTodo._id
                        let p={
                            sendTime: new Date(time),
                            title:item.name,
                            read:false,
                            content: '您的任务 ('+item.name+') 将在十分钟之后达到截止时间,请注意完成'
                        }
                        await DB.findByIdAndUpdate("notify",notify_id,p)
                        let this_mail =(await DB.findOne("notify",this_condition)).result
                        console.log("您的消息提醒",this_mail)
                        return this_mail
                     }
                }

            }
            return 0

        }

    }
}




module.exports =use