import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import { uploadOnCloud } from "../utils/cloudinary.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
// const registerUser=asyncHandler(async(req,res)=>{
//     res.status(200).json({message:"ok"});
// })

const generateAccessTokenandRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = jwt.sign(
      {
        _id: user._id,
        email: user.email,
        username: user.username,
        fullname: user.fullname,
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
      }
    );

    const refreshToken = jwt.sign(
      {
        _id: user._id,
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
      }
    );

    user.refreshToken = refreshToken;
    // user.save({ validateBeforeSave: false })
    user.save();

    return { accessToken, refreshToken };
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "something went wrong" });
  }
};

const registerUser = async (req, res) => {
  const { fullName, email, password, username } = req.body;

  if (
    [fullName, email, password, username].some((field) => {
      field?.trim() === "";
    })
  ) {
    res.status(400).json({ msg: "all fields are mendatory" });
  }
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (user) {
    res.status(409).json({ msg: "user already present" });
  }

  const avatarPath = req.files?.avatar[0]?.path;
  // const coverPath=req.files?.coverImage[0]?.path

  if (!avatarPath) {
    res.status(400).json({ msg: "avatar file is required" });
  }
  let coverPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverPath = req.files.coverImage[0].path;
  }
  const avatar = await uploadOnCloud(avatarPath);
  const cover = await uploadOnCloud(coverPath);

  if (!avatar) {
    res.status(400).json({ msg: "avatar file is required" });
  }

  const createdUser = await User.create({
    username: username.toLowerCase(),
    fullName,
    email,
    password,
    avatar: avatar.url,
    coverImage: cover?.url || "",
  });
  const checkedUser = await User.findById(createdUser._id).select(
    "-password -refreshToken"
  );
  if (!checkedUser) {
    res.status(500).json({ msg: "server not responding" });
  }
  return res
    .status(201)
    .json({ data: checkedUser, msg: "user registered successfully" });
};

// login controller

const loginUser = async (req, res) => {
  try{

  
  const { username, email, password } = req.body;

  if (!username && !email) {
    res.status(400).json({message:"username or email required" });
  }
  const user = await User.findOne({
    $or: [{ email }, { username }],
  });
  //  const user = await User.findOne({username});
  if (!user) {
    res.status(404).json({ msg: "user not find" });
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    res.status(400).json({ msg: "Invalid credentials" });
  }
  const { accessToken, refreshToken } =await generateAccessTokenandRefreshToken(user._id);

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

  // setting tokens in cookie
  const options = {
    httpOnly: true,
    secure: true,
  };
  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json({
      data: loggedInUser,
      accessToken,
      refreshToken,
      message: "User successfully logged in",
    });
  }
  catch(err){
    console.log("error")
    res.status(500).json("something went wrong")
  }
};


const logoutUser=async(req,res)=>{
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set:{
        refreshToken:undefined
      }
    }
  )
  const options = {
    httpOnly: true,
    secure: true,
  };
  res.status(200).clearCookie("accessToken",options).clearCookie("refreshToken",options).json("User logged out successfully")
}

export { registerUser, loginUser , logoutUser };
