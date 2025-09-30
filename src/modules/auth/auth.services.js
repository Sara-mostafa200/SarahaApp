
import {
  providerEnum,
  roleEnum,
  UserModel,
} from "../../DB/models/index.model.js";
import { asyncHandler, successResponse } from "../../utils/response.js";
import * as DBService from "../../DB/db.service.js";
import {
  compareHash,
  generateHash,
} from "../../utils/security/hash.security.js";
import { AsymmetricEncryption, encrypted } from "./../../utils/security/encryption.security.js";
import {
  generateToken,
  signatureTypeEnum,
} from "../../utils/security/token.security.js";
import { OAuth2Client } from "google-auth-library";
import { customAlphabet, nanoid } from "nanoid";
import { emailEvent } from "../../utils/Events/email.events.js";
import { emailTemplate } from "../../utils/Email/tamplate.email.js";
import { updateOne } from "./../../DB/db.service.js";
// helper services
async function verify(idToken) {
  const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.WEB_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  return payload;
}

const generateLoginToken = async (user) => {


  const jwtid = nanoid()
  // jwt
  const Token = await generateToken({
    payload: { id: user._id},
    options:{
      jwtid,
      expiresIn :"6h"
    }
  });

  const refresh = await generateToken({
    payload: { id: user._id },
    signature: process.env.REFRESH_TOKEN_USER_SIGNATURE,
    options: { expiresIn: "1y" , jwtid},
  });

  return { Token, refresh };
};

// auth services

// system
export const signup = asyncHandler(async (req, res, next) => {
  const { fullName, email, password, phone, role } = req.body;

  if (await DBService.findOne({ model: UserModel, filter: { email } })) {
    return next(new Error("email already exist", { cause: 409 }));
  }

  const hashPassword = generateHash({ plaintext: password });
  const encryptedPhone = encrypted({ plaintext: phone });

  const OTP = customAlphabet("0123456789", 4)();

  const hasedOtp = generateHash({ plaintext: OTP });
  const html = emailTemplate(OTP);
  emailEvent.emit("sendConfirmEmail", { email, OTP, html });

  const [user] = await DBService.create({
    model: UserModel,
    data: {
      fullName,
      email,
      password: hashPassword,
      phone: encryptedPhone,
      role,
      confirmLoginOtp: hasedOtp,
    },
  });

  return successResponse({
    res,
    status: 201,
    message: "account created successfully ",
    data: { user },
  });
});

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await DBService.findOne({ model: UserModel, filter: { email } });
  if (!user) {
    return next(new Error("email or password are not correct", { cause: 404 }));
  }

  if (!user?.confirmEmail) {
    return next(new Error("Please confirm your email"));
  }

  if (!(await compareHash({ plaintext: password, hashValue: user.password }))) {
    return next(new Error("email or password are not correct", { cause: 404 }));
  }

  const { refresh, Token } = await generateLoginToken(user);

  return successResponse({
    res,
    data: { token: Token, refreshToken: refresh },
  });
});

export const confirmEmail = asyncHandler(async (req, res, next) => {
  const { email, OTP } = req.body;

  const user = await DBService.findOne({
    model: UserModel,
    filter: {
      email,
      provider: providerEnum.system,
      confirmEmail: { $exists: false },
      confirmLoginOtp: { $exists: true },
    },
  });

  if (!user) {
    return next(new Error("email is not correct", { cause: 404 }));
  }

  if (
    !(await compareHash({ plaintext: OTP, hashValue: user.confirmLoginOtp }))
  ) {
    return next(new Error("otp is not correct", { cause: 404 }));
  }

  const updatedUser = await DBService.updateOne({
    model: UserModel,
    filter: { email },
    data: {
      $set: {
        confirmEmail: Date.now(),
      },
      $unset: {
        confirmLoginOtp: 1,
      },
    },
  });

  return successResponse({
    res,
  });
});

export const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await DBService.findOne({
    model: UserModel,
    filter: {
      email,
      freezedAt: { $exists: false },
      confirmEmail: { $exists: true },
    },
  });

  if (!user) {
    return next(new Error("user does't exists", { cause: 404 }));
  }

  const OTP = customAlphabet("0123456789", 4)();

  const hashOtp = generateHash({ plaintext: OTP });
  const html = emailTemplate(OTP);
  emailEvent.emit("forgotPassword", { email, OTP, html });

  const newUserData = await updateOne({
    model: UserModel,
    filter: {
      _id: user._id,
    },
    data: {
      $set: {
        forgotCode: hashOtp,
      },
    },
  });

  return successResponse({
    res,
  });
});

export const verifyOTP = asyncHandler(async (req, res, next) => {
  const { email, OTP } = req.body;

  const user = await DBService.findOne({
    model: UserModel,
    filter: {
      email,
      confirmEmail: { $exists: true },
      freezedAt:{$exists:false},
      forgotCode: { $exists: true },
    },
  });

  if (!user) {
    return next(new Error("email or OTP is not correct", { cause: 404 }));
  }

  if (
    !(await compareHash({ plaintext: OTP, hashValue: user.forgotCode }))
  ) {
    return next(new Error("otp is not correct", { cause: 404 }));
  }


  return successResponse({
    res,
  });
});

export const changePassword = asyncHandler(async (req, res, next) => {
  const { email, OTP , password } = req.body;

  const user = await DBService.findOne({
    model: UserModel,
    filter: {
      email,
      confirmEmail: { $exists: true },
      freezedAt:{$exists:false},
      forgotCode: { $exists: true },
    },
  });

  if (!user) {
    return next(new Error("email or OTP is not correct", { cause: 404 }));
  }

  if (
    !(await compareHash({ plaintext: OTP, hashValue: user.forgotCode }))
  ) {
    return next(new Error("otp is not correct", { cause: 404 }));
  }

  const newPassword = await generateHash({plaintext:password});

  const updatedUser = await updateOne({
    model:UserModel,
    filter:{
      _id:user._id
    },
    data:{
      $set:{
        password:newPassword,
        changePasswordTime:Date.now()
      },
      $unset:{
      forgotCode:1
      }
    }
  })


  return successResponse({
    res,
    updatedUser
  });
});

//WithGmail
export const signWithGmail = asyncHandler(async (req, res, next) => {
  const { idToken } = req.body;
  const { email, email_verified, name, picture } = await verify(idToken);

  if (!email_verified) {
    return next(new Error("email not verified"));
  }

  const isUserExist = await DBService.findOne({
    model: UserModel,
    filter: { email },
  });

  if (isUserExist) {
    return next(new Error("Email already exist", { cause: 409 }));
  }

  const user = await DBService.create({
    model: UserModel,
    data: {
      email,
      confirmEmail: Date.now(),
      fullName: name,
      picture,
      provider: providerEnum.google,
    },
  });

  return successResponse({ res, status: 201, data: { user } });
});

export const loginWithGmail = asyncHandler(async (req, res, next) => {
  const { idToken } = req.body;
  const { email, email_verified } = await verify(idToken);

  if (!email_verified) {
    return next(new Error("email not verified"));
  }

  const user = await DBService.findOne({
    model: UserModel,
    filter: { email, provider: providerEnum.google },
  });

  if (!user) {
    return next(new Error("wrong email", { cause: 404 }));
  }

  const { Token, refresh } = await generateLoginToken(user);
  return successResponse({
    res,
    data: { token: Token, refreshToken: refresh },
  });
});

export const refreshToken = asyncHandler(async (req, res, next) => {
  const user = req.user;
  const { Token, refresh } = await generateLoginToken(user);
  return successResponse({ res, data: { token: Token } });
});
