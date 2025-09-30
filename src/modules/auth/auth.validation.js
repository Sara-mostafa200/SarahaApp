import joi from "joi";
import { generalFields } from "../../middleware/validation.middleware.js";
import { roleEnum } from "../../DB/models/User.model.js";

export const signup = {
 body: joi.object().keys({
 fullName: generalFields.fullName.required(),
 email:generalFields.email.required(),
 password:generalFields.password.required(),
 confirmPassword:generalFields.confirmPassword.required(),
 phone:generalFields.phone.required(),
 role:joi.string().valid(...Object.values(roleEnum))
}).required(),

query : joi.object().keys({
 lang : generalFields.lang.required()
}).required()
}

export const login = {
    body: joi.object().keys({
        email:generalFields.email.required(),
        password:generalFields.password.required()
    })
}

export const confirmGmail = {
    body: joi.object().keys({
        email:generalFields.email.required(),
        OTP:generalFields.OTP.required()
    })
}


export const withGmail = {
    body: joi.object().keys({
        idToken:joi.string().required(),
    })
}


export const forgotPassword = {
    body: joi.object().keys({
        email:generalFields.email.required(),
    })
}

export const verifyOTP = {
    body: joi.object().keys({
        email:generalFields.email.required(),
        OTP:generalFields.OTP.required()
    })
}

export const changePassword = {
    body: joi.object().keys({
        email:generalFields.email.required(),
        password:generalFields.password.required(),
        confirmPassword:generalFields.confirmPassword.required(),
        OTP:generalFields.OTP.required()
    })
}

