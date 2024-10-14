import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"

    cloudinary.config({  // with the help of this we are identifying user for uploading file
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET 
    });

const uploadonCloudinary = async (localFilePath)=>{

try {
    if(!localFilePath)return null;
    // console.log("Attempting to upload failed:", localFilePath);

    const response = await cloudinary.uploader.upload(localFilePath,{     // For Upload the file on cloudinary
    resource_type: "auto" })
// console.log("file is uploaded successfully" , response.url) // By this we get the url that we want after uploading of file
fs.unlinkSync(localFilePath)// Remove the locally saved temporary file as the upload operation got success
return response;

} catch (error) {
    console.error("Cloudinary upload error:", error.message);
    fs.unlinkSync(localFilePath)  // Remove the locally saved temporary file as the upload operation got failed
    return null;
    }
}
 
export default uploadonCloudinary;
