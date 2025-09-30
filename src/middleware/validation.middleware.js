import { Types } from "mongoose";
import { asyncHandler } from "../utils/response.js";
import joi from "joi";
import { genderEnum } from "../DB/models/User.model.js";

export const generalFields = {
  fullName: joi.string().min(2).max(20),
  email: joi
    .string()
    .email({
      minDomainSegments: 1,
      maxDomainSegments: 2,
      tlds: { allow: ["com"] },
    }),
  password: joi
    .string()
    .pattern(new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/))
    .message({
      "string.pattern.base": "password is too week",
    }),
  confirmPassword: joi.string().valid(joi.ref("password")),
  phone: joi.string().pattern(new RegExp(/^(002\+2)?01[0125][0-9]{8}$/)),
  lang: joi.string().valid("ar", "en"),
  OTP: joi.string().pattern(new RegExp(/^\d{4}$/)),
  id: joi.string().custom((value, helper) => {
    return Types.ObjectId.isValid(value) ? true : helper.message("in-valid id");
  }),
  gender:joi.string().valid(...Object.values(genderEnum)),

};

export const Validation = (schema) => {
  return asyncHandler(async (req, res, next) => {
    const ValidationErrors = [];
    for (const key of Object.keys(schema)) {
      const validationResult = schema[key].validate(req[key], {
        abortEarly: false,
      });

      if (validationResult.error) {
        ValidationErrors.push(validationResult.error?.details);
      }
    }

    if (ValidationErrors.length > 0) {
      return res
        .status(400)
        .json({ message: "validation error", error: ValidationErrors });
    }

    return next();
  });
};
