import joi from 'joi'

import { generalFields } from '../../middleware/validation.middleware.js'
export const sharedProfileSchema ={
    params:joi.object().keys({
    userId : generalFields.id.required()
})
} 


export const updateBasicProfile ={
    body:joi.object().keys({
    firstName : generalFields.fullName,
    lastName:generalFields.fullName,
    gender:generalFields.gender,
    phone:generalFields.phone
})
} 


export const freezeAccount = {
    params: joi.object().keys({
        userId : generalFields.id,
    })
}

export const restoredAccount = {
    params: joi.object().keys({
        userId : generalFields.id,
    })
}

export const deleteAccount = {
    params: joi.object().keys({
        userId : generalFields.id,
    })
}

export const updatePassword = {
    body: joi.object().keys({
        oldPassword : joi.string().required(),
        password: generalFields.password.not(joi.ref("oldPassword")).required(),
        confirmPassword: generalFields.confirmPassword.required() ,
    })
}
