import {  deleteFile, uploadFile } from "../../common/services/cloudinary.service.js";
import { create, deleteMany, deleteOne, findById, findOneAndUpdate, updateOne } from "../../DB/db.service.js";
import { roleEnum, UserModel , MessageModel , revokeTokenModel } from "../../DB/models/index.model.js";
import {
  decrypted,
  encrypted,
} from "../../utils/security/encryption.security.js";
import { compareHash, generateHash } from "../../utils/security/hash.security.js";
import { asyncHandler, successResponse } from "./../../utils/response.js";
import mongoose from "mongoose";

export const sharedProfile = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  const user = await findById({
    model: UserModel,
    id: userId,
    select: "-password -role",
  });

  if (!user) {
    return next(new Error("user not found", { cause: 404 }));
  }

  const dec_phone = decrypted({ value: user.phone });
  user.phone = dec_phone;
  return successResponse({ res, data: { user } });
});

export const updateUser = asyncHandler(async (req, res, next) => {
  const { user } = req;
  if (req.body.phone) {
    const phone = encrypted({ value: user.phone });
    user.phone = phone;
  }

  const newUser = await findOneAndUpdate({
    model: UserModel,
    filter: {_id:user._id},
    data: {
      $set: req.body,
      $inc: { __v: 1 },
    }
  });

  if (!newUser) {
    return next(new Error("user not found", { cause: 404 }));
  }

  return successResponse({ res, data: { newUser } });
});

export const freezeUserProfile = asyncHandler(
  async (req, res, next) => {
  const { userId } = req.params;
  const {user} = req
  
  if(userId && user.role !== roleEnum.system )
  {
    return next(new Error("regular users cannot freeze other users accounts" , {cause:403}))
  }

  const deletedUser = await updateOne({
    model: UserModel,
    filter: {
      _id:userId || user._id,
      freezedAt:{$exists : false}
    },
    data: {
      $set:{
        freezedAt:Date.now(),
        freezedBy:user.id
      },
      $unset:{
        restoredAt:1,
        restoredBy:1
      },
      $inc: { __v: 1 },
    }
  });
  if (!deletedUser.matchedCount) {
    return next(new Error("user not found", { cause: 404 }));
  }

  return successResponse({ res, data: { deletedUser } });
});


export const restoredUserProfile = asyncHandler(
  async (req, res, next) => {
  const { userId } = req.params;
  const {user} = req
  
  if(userId && user.role !== roleEnum.system )
  {
    return next(new Error("regular users cannot restore other users accounts" , {cause:403}))
  }

  const restoredUser = await updateOne({
    model: UserModel,
    filter: {
      _id:userId || user._id,
      freezedAt:{$exists : true}
    },
    data: {
      $set:{
        restoredAt:Date.now(),
        restoredBy:user.id
      },
      $unset:{
        freezedAt:1,
        freezedBy:1
      },
      $inc: { __v: 1 },
    }
  });

  if (!restoredUser.matchedCount) {
    return next(new Error("user not found", { cause: 404 }));
  }

  return successResponse({ res, data: { restoredUser } });
});

export const deleteUserProfile = asyncHandler(
  async (req, res, next) => {
  const { userId } = req.params;
  const {user} = req
  
  if(userId && user.role !== roleEnum.system )
  {
    return next(new Error("regular users cannot delete other users accounts" , {cause:403}))
  }

  const session = await mongoose.startSession()
  req.session = session;
  session.startTransaction()
  
   
   const deletedUser = await deleteOne({
    model: UserModel,
    filter: {
      _id:userId || user._id,
      freezedAt:{$exists : true}
    },
    session
  });

 
  
  await deleteMany({model:MessageModel , filter:userId ? {receiverId:userId} : {receiverId:user._id}, session })
  
  if (!deletedUser.deletedCount) {
    return next(new Error("user not found", { cause: 404 }));
  }
 await deleteFile(user && { publicId:user.picture.public_id})
  await session.commitTransaction();
  session.endSession()
  
  return successResponse({ res, data: { deletedUser } });

    
  
  
});

export const updatePassword = asyncHandler(
  async (req, res, next) => {
  const { oldPassword ,password } = req.body;
  const {user} = req
  
  if( !await compareHash({plaintext:oldPassword , hashValue: user.password}) )
  {
    return next(new Error("wrong password "))
  }


  const updatedPassword = await generateHash({plaintext:password})

  const updatedUser = await updateOne({
    model: UserModel,
    filter: {
      _id:user._id,
    },
    data: {
      $set:{
        password:updatedPassword,
        changePasswordTime:Date.now()
      },
      $inc: { __v: 1 },
    }
  });

  if (!updatedUser.matchedCount) {
    return next(new Error("user not found", { cause: 404 }));
  }

  return successResponse({ res, data: { updatedUser } });
});

export const logout = asyncHandler(
  async (req, res, next) => {
  
  const {user , decoded} = req;
  
  await create({
    model:revokeTokenModel,
    data:{
      idToken: decoded.jti,
      expireRefreshDate:decoded.iat + 31536000 , 
      expireAccessDate:decoded.exp , 

    }
  })

  return successResponse({ res });
});

export const uploadImage = asyncHandler(
  async (req , res , next)=>{
    const {user}= req
    const {path} = req.file
    
    
    const uploadImage = await uploadFile(path , {folder : `sarahaApp/users/profile/${user._id}`});
    const userData = await UserModel.findByIdAndUpdate(user._id , { picture:{
      public_id:uploadImage.public_id,
  secure_url:uploadImage.secure_url
    } } , {new:true})
   
    successResponse({res , data:userData})
  }
)


export const uploadCovers = asyncHandler(
  async (req , res , next)=>{
    const covers = []
    for (const file of req.files) {
      covers.push(file.finalPath)
    }

   await findOneAndUpdate({
    model:UserModel,
    filter:{_id: req.user._id},
    data:{
      $set:{
        covers
      }
    }
   })
   return successResponse({res})
  }
)

export const getUser = asyncHandler(async (req, res, next) => {
  const { user } = req;

  if (!user) {
    return next(new Error("user not found", { cause: 404 }));
  }

  const dec_phone = decrypted({ value: user.phone });
  user.phone = dec_phone;
  return successResponse({ res, data: { user } });
});


export const getUsers = async(req , res , next) => {
  const users = await UserModel.find().populate('message');

  return successResponse({res , data:users})
}
