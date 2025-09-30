import mongoose, { Schema } from "mongoose";


const revokeTokenSchema= new mongoose.Schema({
 idToken:{
   type:String,
   required:[true , 'idToken is required'],
   unique : true
 },
 expireRefreshDate:{type:Number , required:true},
 expireAccessDate:{type:Number , required:true},
},
{
 timestamps:true,
 toJSON:{virtuals:true},
 toObject:{virtuals:true}
})



export const revokeTokenModel = mongoose.models.revokeToken || mongoose.model('revokeToken' , revokeTokenSchema);
revokeTokenModel.syncIndexes()