export const asyncHandler = (fn) => {
  return async (req, res, next) => {
    await fn(req, res, next).catch((error) => {
       return next(error , {cause:500})
    });
  };
};


export const successResponse = ({res , message = "success" , status = 200 , data = {}} = {}) => {
  return res.status(status).json({message , data})
}


export const globalErrorHandler = async(error , req , res , next) => {
 
  if( req.session  && req.session.inTransaction()){
   await req.session.abortTransaction();
       req.session.endSession();
         }
  return res.status(error.cause || 400).json({message:error.message , error})
}
