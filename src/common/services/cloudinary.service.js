import {v2 as cloudinaryV2} from 'cloudinary';


cloudinaryV2.config({
    cloud_name: process.env.CLOUDINARY_API_NAME,
    api_key: process.env.CLOUDINARY_API_KEY ,
    api_secret:  process.env.CLOUDINARY_API_SECRET ,
})

export const uploadFile = async(file , options) => {
 const result = await cloudinaryV2.uploader.upload(file , options);
 return result;
}

export const deleteFile = async ({publicId})=>{
    const deletedFile = await cloudinaryV2.uploader.destroy(publicId);
    return deletedFile;
}