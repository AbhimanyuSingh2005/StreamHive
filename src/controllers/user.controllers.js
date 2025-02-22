import {asyncHandler} from "../utils/asyncHandler.js";
import {User} from "../models/user.models.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {uploadOnCludinary} from "../utils/cloudinary.js";

const registerUser = asyncHandler(async (req,res,next) => {
    const {username, email, fullName, password} = req.body;
    if([username,email,fullName,password].some((field) => !field?.trim())){
        throw new ApiError(400,"All Fields Required");
    }
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;
    if(!avatarLocalPath) throw new ApiError(400,"Avatar Is required");

    const existedUser = await User.find({$or:[{username},{email}]});
    console.log(existedUser);
    if(existedUser.length != 0) throw new ApiError(400,"User Already Exist with same username");

    const avatar = await uploadOnCludinary(avatarLocalPath);
    const coverImage = await uploadOnCludinary(coverImageLocalPath);

    if(!avatar) throw new ApiError(500,"Avatar Upload failed");
    
    const user = await User.create({
        username,
        email,
        fullName,
        avatar : avatar?.url || "",
        coverImage : coverImage?.url || "" ,
        password
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    if(!createdUser){
        throw new ApiError(500,"User Creation Failed");
    }

    res.status(201).send(new ApiResponse(201,"User Creation Successfull",createdUser));
});

export {registerUser};