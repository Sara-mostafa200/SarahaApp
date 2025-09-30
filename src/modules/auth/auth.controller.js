import * as authValidation from "./auth.validation.js";
import  * as authService from "./auth.services.js" ;
import { Router } from "express";
import {Validation , authentication } from '../../middleware/index.middleware.js'
import { tokenTypeEnum } from "../../utils/security/token.security.js";

const router = Router();
router.post('/signup' , Validation(authValidation.signup) ,authService.signup )
router.post('/login' , Validation(authValidation.login) ,authService.login)
router.patch('/confirm-email' , Validation(authValidation.confirmGmail) , authService.confirmEmail)
router.post('/refresh-token', authentication({tokenType:tokenTypeEnum.refresh}) , authService.refreshToken )
router.post('/forgot-password', Validation(authValidation.forgotPassword) , authService.forgotPassword )
router.post('/verify-otp', Validation(authValidation.verifyOTP) , authService.verifyOTP )
router.post('/change-password', Validation(authValidation.changePassword) , authService.changePassword )

router.post('/signWithGmail' ,Validation(authValidation.withGmail) ,authService.signWithGmail)
router.post('/loginWithGmail' ,Validation(authValidation.withGmail) ,authService.loginWithGmail)

export default router; 