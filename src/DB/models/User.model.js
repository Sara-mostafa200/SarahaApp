import mongoose, { Schema } from "mongoose";

export const genderEnum = {male : "male" , female:"female"}
export const roleEnum = {system:"admin" , user:"user"}
export const providerEnum ={ system:'system' , google:'google'}

const userSchema= new mongoose.Schema({
 firstName:{
   type:String,
   required:[true , 'firstName is required'],
   minlength:2,
   maxlength:10
 },
 lastName:{
  type:String,
  required:[true, 'lastName is required'],
   minlength:2,
   maxlength:10
 },
 email:{
    type: String,
    unique:true,
    required:[true , "email is required"]

 },
 password:{
    type:String,
    required:function (){
      return this.provider === providerEnum.google ? false : true ; 
    }
 },
 gender:{
   type:String,
   enum:{values:Object.values(genderEnum) ,message:`gender only allow ${Object.values(genderEnum)}`}
 },
 phone:{
    type:String,
    required: function (){
      return this.provider === providerEnum.google ? false : true ; 
    }
 },
 role:{
   type:String,
   enum:Object.values(roleEnum),
   default:roleEnum.user
 },
 provider:{
   type:String,
   enum:Object.values(providerEnum),
   default:providerEnum.system
 },
 freezedAt: Date,
 freezedBy:{type:mongoose.Schema.Types.ObjectId , ref:'User'},
 restoredAt:Date,
 forgotCode:String,
 changePasswordTime:Date,
 picture:{
  public_id:String,
  secure_url:String
 } ,
 covers:[String],
 restoredBy:{
  type:mongoose.Schema.Types.ObjectId,
  ref:'User'
 },
 confirmEmail:Date,
 confirmPassword:Date,
 confirmLoginOtp:{
  type:String ,
  require:function(){
    return this.provider === providerEnum.system ? true : false ;
  }
 }
},
{
 timestamps:true,
 toJSON:{virtuals:true},
 toObject:{virtuals:true}
})

userSchema.virtual("fullName").set(function(value){
   const [firstName , lastName] = value?.split(" ") || [] ;
   this.set({firstName , lastName})
}).get(function(){
 return this.firstName + " " +this.lastName 
})

userSchema.virtual("message",{
  ref:'Message',
  localField:'_id',
  foreignField:'receiverId'
})


export const UserModel = mongoose.models.User || mongoose.model('User' , userSchema);
UserModel.syncIndexes()