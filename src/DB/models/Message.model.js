import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    content:{
        type:String,
        require:true
    },
    receiverId:{
       type:mongoose.Schema.Types.ObjectId,
       ref:'User'
    }
},
{
 timestamps:true, 
 toJSON:{virtuals:true},
 toObject:{virtuals:true}
})

export const MessageModel = mongoose.models.Message || mongoose.model('Message' , messageSchema);
