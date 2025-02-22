import {v2 as cloudinary} from "cloudinary";
import fs from "fs";



const  uploadOnCludinary = async (filePath)=>{
    try {
        if(!filePath){
            console.log("NO FILE PATH PRESENT");
            return null;
        }
        cloudinary.config({ 
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
            api_key:process.env.CLOUDINARY_API_KEY, 
            api_secret: process.env.CLOUDINARY_API_SECRET
        });
        const uploadResponse = await cloudinary.uploader.upload(filePath,{
            resource_type : "auto"
        })
        console.log("SUCESSFUL FILE UPLOAD ON CLODINARY:",uploadResponse.url);
        return uploadResponse;
    } catch (error) {
        fs.unlinkSync(filePath);
        console.log(error);
        return null;
    }
}

export {uploadOnCludinary} ;