import {asyncHandler} from "../utils/asyncHandler.js";
import {User} from "../models/user.models.js";
import {Vedio} from "../models/vedio.models.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {uploadOnCludinary} from "../utils/cloudinary.js";
import { getAccessToken,getefreshToken } from "../utils/generateJWTtoken.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

const registerUser = asyncHandler(async (req,res,next) => {
    const {username, email, fullName, password} = req.body;
    // console.log(req.body);
    if([username,email,fullName,password].some((field) => !field?.trim())){
        throw new ApiError(400,"All Fields Required");
    }

    // console.log(req.files);

    const avatarLocalPath = req.files?.avatar ? req.files.avatar[0]?.path : null;
    const coverImageLocalPath = req.files?.coverImage ? req.files.coverImage[0]?.path : null;

    if(!avatarLocalPath) throw new ApiError(400,"Avatar Is required");

    const existedUser = await User.find({$or:[{username},{email}]});
    
    // console.log(existedUser);

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


const loginUser = asyncHandler(async (req,res,next) => {
    const {userId,password} = req.body;
    
    if( !userId && !password) throw new ApiError(400,"All fields are reuired.");

    const user = await User.find({$or:[{username : userId},{email : userId}]});
    if(!user) throw new ApiError(400,"Invalid Credentials");
    
    if(!(await user[0].isPasswordCorrect(password))) throw new ApiError(401,"Invalid Credentials");

    const accessToken = await getAccessToken(user[0]);
    const refreshToken = await getefreshToken(user[0]);
    
    const updatedUser = await User.findById(user[0]._id).select("-password -refreshToken");

    const options = {
        httpOnly : true,
        secure : true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(new ApiResponse(200,"user logined sucessfully",{user : updatedUser,refreshToken,accessToken}));
    
})


const logoutUser = asyncHandler(async(req,res,next)=>{
    const user = req.user;
    await User.findByIdAndUpdate(user._id,{$set:{refreshToken:""}},{new:true});
    res.status(200)
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json(new ApiResponse(200,"User logged Out",null));
})

const refreshAccessAndRefreshToken = asyncHandler(async(req,res,next)=>{
    const refreshToken = req.cookies?.refreshToken;
    
    if(!refreshToken) throw new ApiError(401,"No refresh token provided");

    const decode = jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById(decode._id);

    if(!user) throw new ApiError(401,"Invalid Token");

    if(refreshToken != user.refreshToken) throw new Error(401,"Expired Token");

    const accessToken = await getAccessToken(user).then(token=>{return token});
    const newRefreshToken = await getefreshToken(user).then(token=>{return token});
    
    const options = {
        httpOnly : true,
        secure : true
    }

    res.status(200)
    .cookie("accessToken" , accessToken ,options)
    .cookie("refreshToken", newRefreshToken,options)
    .json(new ApiResponse(200,"Token Refreshed",{accessToken,newRefreshToken}));
})

const updatePassword = asyncHandler(async(req,res,next)=>{
    const {newPassword , oldPassword} = req.body;
    if(!newPassword || !oldPassword) throw new ApiError(401,"All fields are neccesary");
    const user = await User.findById(req.user._id);
    if(!(await user.isPasswordCorrect(oldPassword))) throw new ApiError(401,"Wrong password");
    user.password = newPassword;
    await user.save({validationBeforeSave : false});
    res.status(200)
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json(new ApiResponse(200,"Password Changed",null));
})

const getCurrentUser = asyncHandler(async(req,res,next)=>{
    return res.status(200)
    .json(new ApiResponse(200,"current User Details",req.user));
})

const updateUserDetails = asyncHandler(async(req,res,next)=>{
    const {username , fullName, email} = req.body;
    // console.log(!username || !fullName || !email);
    if(!username && !fullName && !email) throw new ApiError(401,"No fields are given");
    const user = await User.findByIdAndUpdate(req.user._id,{
        $set : {
            username : username?username:req.user.username,
            fullName : fullName?fullName:req.user.fullName,
            email : email?email:req.user.email
        }
    }).select("-password -refreshToken");
    return res.status(200)
    .json(new ApiResponse(200,"User details updated",user))
})

const updateAvatar = asyncHandler(async(req,res,next)=>{
    const avatarLocalPath = req.file?.path;
    if(!avatarLocalPath) throw new ApiError(401,"Avatar is not uploaded");

    const avatar = await uploadOnCludinary(avatarLocalPath);

    if(!avatar) throw new ApiError(401,"Avatar upload failed");

    const user = await User.findByIdAndUpdate(req.user._id,{
        $set:{
            avatar : avatar.url
        }
    }).select("-password -refreshToken");

    return res.status(200)
    .json(new ApiResponse(200,"new Avatar Uploaded",user));    
})

const updateCoverImage = asyncHandler(async(req,res,next)=>{
    const coverImageLocalPath = req.file?.path;
    
    if(!coverImageLocalPath) throw new ApiError(401,"coverImage is not uploaded");

    const coverImage = await uploadOnCludinary(coverImageLocalPath);

    if(!coverImage) throw new ApiError(401,"coverImage upload failed");

    const user = await User.findByIdAndUpdate(req.user._id,{
        $set:{
            coverImage : coverImage.url
        }
    }).select("-password -refreshToken");

    return res.status(200)
    .json(new ApiResponse(200,"new coverImage Uploaded",user)); 
})

const getChannelProfile = asyncHandler(async(req,res,next)=>{
    const {username} = req.params;
    
    if (!username?.trim()) {
        throw new ApiError(400, "username is missing")
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1
            }
        }
    ])

    if(!channel?.length){
        throw new ApiError(404, "Channel Does not exist");
    }

    res.status(200)
    .json(new ApiResponse(200, "Channel Profile", channel[0]));
});

const getWatchHistory = asyncHandler(async(req,res,next)=>{
    const watchHistory = await User.aggregate([
        {
            $match : {
                _id : new mongoose.Types.ObjectId(req.user._id)
    
            }
        },
        {
            $lookup: {
                from: "vedios",
                localField : "watchHistory",
                foreignField : "_id",
                as : "watchHistory",
                pipeline : [
                    {
                        $lookup:{
                            from: "users",
                            localField: owner,
                            foreignField: _id,
                            as : "owner",
                            pipeline : [
                                {
                                    $project : {
                                        fullName : 1,
                                        username : 1,
                                        avatar : 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields : {
                            owner :{
                                $first : "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ]);

    res.status(200)
    .json(200,"Watch Histroy",watchHistory);
}) 



export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessAndRefreshToken,
    updatePassword,
    getCurrentUser,
    updateUserDetails,
    updateAvatar,
    updateCoverImage,
    getChannelProfile,
    getWatchHistory
};