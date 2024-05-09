import jwt from "jsonwebtoken"
import { User } from "../models/user.models.js"
const verifyUser=async(req,res,next)=>{
    try{
        const token=req.cookies?.accessToken
    if(!token){
        res.status(401).json("unauthorised access")
    }
    // console.log("cooki access token",req.cookies.accessToken)
    const info=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    if(!info){
        res.status(401).json("INvalid user")
    }
    const user=await User.findById(info._id).select("-password -refreshToken")
    if(!user){
        res.status(401).json("User not found")
    }
    req.user=user
    next()
    }
    catch(err){
        res.status(401).json("invalid user , unauthorised access")
    }
}
export {verifyUser}


