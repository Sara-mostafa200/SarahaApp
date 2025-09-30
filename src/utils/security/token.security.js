import jwt from "jsonwebtoken";
import { UserModel } from "../../DB/models/User.model.js";
import { findById, findOne } from "../../DB/db.service.js";
import { revokeTokenModel } from "../../DB/models/revokeToken.model.js";

export const signatureTypeEnum = { system: "system", bearer: "bearer" };
export const tokenTypeEnum = { access: "access", refresh: "refresh" };
export const generateToken = async ({
  payload = "",
  signature = process.env.ACCESS_TOKEN_USER_SIGNATURE,
  options = { expiresIn: "6h" },
} = {}) => {
  const token = jwt.sign(payload, signature, options);
  return token;
};

export const verifyToken = async ({
  token = "",
  signature = process.env.ACCESS_TOKEN_USER_SIGNATURE,
} = {}) => {
  const tokenPayload = jwt.verify(token, signature);
  
  return tokenPayload;
};

// export const getSignatures = async (signatureLevel) => {
//   let signatures = { accessSignature: undefined, refreshSignature: undefined };

//   switch (signatureLevel) {
//     case signatureTypeEnum.system:
//       signatures = {
//         accessSignature: process.env.ACCESS_TOKEN_SYSTEM_SIGNATURE,
//         refreshSignature: process.env.REFRESH_TOKEN_SYSTEM_SIGNATURE,
//       };

//       break;
//     default:
//       signatures = {
//         accessSignature: process.env.ACCESS_TOKEN_USER_SIGNATURE,
//         refreshSignature: process.env.REFRESH_TOKEN_USER_SIGNATURE,
//       };
//       break;
//   }

//   return signatures;
// };

export const decodedToken = async ({
  token = "",
  tokenType = tokenTypeEnum.access,
  next,
} = {}) => {
  // const {token} = authorization|| [];

  if (!token) {
    return next(new Error("in-valid token"));
  }

  // const { accessSignature, refreshSignature } = await getSignatures(
  //   bearer != "Bearer" ? signatureTypeEnum.system : signatureTypeEnum.bearer
  // );

  const decoded = await verifyToken({
    token,
    signature:
      tokenType == tokenTypeEnum.access ? process.env.ACCESS_TOKEN_USER_SIGNATURE : process.env.REFRESH_TOKEN_USER_SIGNATURE,
  });

  if (!decoded.id) {
    return next(new Error("in-valid token role"));
  }

  const expireToken = await findOne({
    model: revokeTokenModel,
    filter: { idToken: decoded.jti },
  });

  if(expireToken){
        return next(new Error("user has signed out from this device", { cause: 401 }));

  }

  const user = await findById({ model: UserModel, id: decoded.id });

  if (!user) {
    return next(new Error("in-valid data", { cause: 400 }));
  }

  if (
    user?.changePasswordTime &&
    decoded.iat * 1000 < new Date(user.changePasswordTime).getTime()
  ) {
    return next(new Error("old token", { cause: 401 }));
  }
  return { user, decoded };
};
