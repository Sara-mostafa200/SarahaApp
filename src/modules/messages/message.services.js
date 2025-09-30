import { create } from "../../DB/db.service.js";
import { UserModel , MessageModel } from "../../DB/models/index.model.js";
import { successResponse } from "../../utils/response.js"

export const sendMessage = async(req, res , next) =>{
    const {content} = req.body;
    const {receiverId} = req.params;

    const user = await UserModel.findById(receiverId);

    if(!user){
        return res.status(404).json({message:'user not found'})
    }

    const message = await create({model:MessageModel , data:{content , receiverId}})
    return successResponse({res , message});
}

export const findMessages = async(req, res , next) =>{
    const messages = await MessageModel.find().populate([{
        path:"receiverId",
        select:'firstName lastName'
    }]);

    return successResponse({res , message:messages});
}