import { Router } from "express";
import * as userServices from "./user.services.js";
import { authentication, authorization } from "../../middleware/authentication.middleware.js";
import { endPoint } from "./authorization.user.js";
import { Validation } from "../../middleware/validation.middleware.js";
import * as userValidation from './user.validation.js'
import { fileValidators, localFileUpload } from "../../utils/multer/local.multer.js";
import { hostUpload } from "../../utils/multer/hostUpload.multer.js";

const router = Router();

router.get('/' , authentication() , authorization(endPoint.profile) , userServices.getUser )
router.get('/users' , userServices.getUsers )
router.get('/:userId/shared-profile' , Validation(userValidation.sharedProfileSchema) , userServices.sharedProfile )
router.patch('/update-basic-profile' , authentication() , Validation(userValidation.updateBasicProfile) ,userServices.updateUser )
router.delete('{/:userId}/freeze-profile' , authentication() , Validation(userValidation.freezeAccount) ,userServices.freezeUserProfile )
router.patch('{/:userId}/restored-profile' , authentication() , Validation(userValidation.restoredAccount) ,userServices.restoredUserProfile )
router.delete('{/:userId}/hard-delete' , authentication() , Validation(userValidation.deleteAccount) ,userServices.deleteUserProfile )
router.patch('/password' , authentication() , Validation(userValidation.updatePassword) ,userServices.updatePassword )
router.patch('/image' , authentication() , hostUpload({ValidationFile: fileValidators.image}).single("image") ,userServices.uploadImage )
router.patch('/covers' , authentication() , localFileUpload({customPath:'userCover' , ValidationFile: fileValidators.image}).array("covers") ,userServices.uploadCovers )
router.post('/logout' , authentication() ,userServices.logout )

export default router;