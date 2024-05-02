import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs'


cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_SECRET_KEY 
});

const uploadOnCloud=async(localFilePath)=>{
    try{
        if(!localFilePath)return null
        // upload the file on cloud
        const respone=await cloudinary.uploader.upload(localFilePath,{
            resource_type:'auto'
        })
        // file uploaded successfully
        console.log("successfully file uploaded on the cloudinary : ",respone.url)
        fs.unlinkSync(localFilePath)

        return respone
    }
    catch(err){
        fs.unlinkSync(localFilePath) //removes the locally save temp file as the upload operation got failed
        return null
    }
}




// cloudinary.uploader.upload("https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
//   { public_id: "olympic_flag" }, 
//   function(error, result) {console.log(result); });

export {uploadOnCloud}