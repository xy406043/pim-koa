const DB=require("../module/db/db-mongoose")

module.exports={
    CheckUser: async (data) => {
        let result = await DB.findOne("users",{"userName":data.userName})
        if(result!=={}){
            return true
        }else{
            return false
        }
    }
}