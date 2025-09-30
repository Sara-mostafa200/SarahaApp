import multer from "multer"

export const hostUpload = ({ValidationFile = []})=>{
    const storage = multer.diskStorage({})

   const fileFilter = (req , file , callback)=>{
    if(!ValidationFile.includes(file.mimetype)){
        return callback('in-valid type format' , false)
    }
     callback(null , true )
   }

 return multer({storage , fileFilter })
}