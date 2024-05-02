import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import { uploadOnCloud } from "../utils/cloudinary.js";
// const registerUser=asyncHandler(async(req,res)=>{
//     res.status(200).json({message:"ok"});
// })
const registerUser=async(req,res)=>{
     const {fullName,email,password,username}=req.body

     if(
        [fullName,email,password,username].some((field)=>{
            field?.trim()===""
        })
     ){
        res.status(400).json({msg:"all fields are mendatory"})
     }
     const user=await User.findOne({
        $or:[{username},{email}]
     })
     if(user){
        res.status(409).json({msg:"user already present"})
     }

    const avatarPath= req.files?.avatar[0]?.path
    // const coverPath=req.files?.coverImage[0]?.path

    if(!avatarPath){
        res.status(400).json({msg:"avatar file is required"})
    }
    let coverPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
        coverPath=req.files.coverImage[0].path
    }
    const avatar=await uploadOnCloud(avatarPath)
    const cover=await uploadOnCloud(coverPath)


    if(!avatar){
        res.status(400).json({msg:"avatar file is required"})
    }

    const createdUser=await User.create({
        username:username.toLowerCase(),
        fullName,
        email,
        password,
        avatar:avatar.url,
        coverImage:cover?.url || ""
    })
    const checkedUser=await User.findById(createdUser._id).select(
        "-password -refreshToken"
    )
    if(!checkedUser){
        res.status(500).json({msg:"server not responding"})
    }
    return res.status(201).json({data:checkedUser,msg:"user registered successfully"})
}

export {registerUser}