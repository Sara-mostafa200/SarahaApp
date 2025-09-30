import { UserModel , revokeTokenModel } from "../DB/models/index.model.js";
import { asyncHandler } from "../utils/response.js";
import {
  decodedToken,
  signatureTypeEnum,
  tokenTypeEnum,
  verifyToken,
} from "../utils/security/token.security.js";

export const authentication = ({ tokenType = tokenTypeEnum.access } = {}) => {
  return asyncHandler(async (req, res, next) => {
    const { authorization:token } = req.headers;
    if(!token){
     return next(new Error('unauthorized' , {cause:404}))
    }
    
    const { user, decoded } = await decodedToken({
      token,
      tokenType,
      next,
    });

   
    if (!user) {
      return next(new Error("user not found", { cause: 404 }));
    }

    req.user = user;
    req.decoded = decoded;
    return next();
  });
};

export const authorization = (accessRoles = []) => {
  return asyncHandler(async (req, res, next) => {
    if (!accessRoles.includes(req.user.role)) {
      return next(new Error("user is not authorized", { cause: 401 }));
    }

    return next();
  });
};
