import path from 'node:path'
import fs from 'node:fs'
import multer from "multer";

export const fileValidators = {
    image:['image/png' , 'image/jpeg']
}

export const localFileUpload = ({customPath = 'general' , ValidationFile = []} = {})=>{
    let basePath = `./uploads/${customPath}`;
    let currentPath = path.resolve(`./src/${basePath}`)
    const fileSize = 1* 1024 * 1024
    

    const storage = multer.diskStorage({
    destination:function(req , file , callback){
        if(req.user?._id){
        basePath += `/${req.user._id.toString()}`;
        currentPath = path.resolve(`./src/${basePath}`)
        }

        if(!fs.existsSync(currentPath)){
        fs.mkdirSync(currentPath , {recursive:true})
    }
        callback(null , currentPath)
    },
    filename:function(req , file , callback){
        const uniqueFileName = Date.now() + '_' + Math.random() + '_' + file.originalname;
        file.finalPath = basePath+"/"+uniqueFileName;
        callback(null , uniqueFileName)
    },
})

   const fileFilter = (req , file , callback)=>{
    if(!ValidationFile.includes(file.mimetype)){
        return callback('in-valid type format' , false)
    }
     callback(null , true )
   }

 return multer({dest:'temp'  ,  storage , fileFilter  , limits:{fileSize} })
}
