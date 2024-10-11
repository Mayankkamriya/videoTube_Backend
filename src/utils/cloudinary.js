import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"

    cloudinary.config({  // with the help of this we are identifying user for uploading file
        cloud_name: CLOUDINARY_CLOUD_NAME, 
        api_key: CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET 
    });

const uploadonCloudinary = async (localFilePath)=>{
try {
    if(!localFilePath)return null
    
    // For Upload the file on cloudinary
cloudinary.uploader.upload(localFilePath,{
    resource_type: "auto"
})

//For file uploaded successfully 
console.log("file is uploaded" , response.url) // By this we get the url that we want after uploading of file
 return response;

} catch (error) {
    // Remove the locally saved temporary file as the upload operation got failed
    fs.unlinkSync(localFilePath)
    return null;
    }
}
 
export {uploadonCloudinary}
