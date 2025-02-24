
import { ApiError } from "./ApiError.js";
import { User } from "../models/user.models.js";

const getAccessToken = async(user) =>{
    try {
        
        const accessToken = user.generateAcessToken();
        if(!accessToken) throw new ApiError(500,"Access Generation Failed");
        // console.log(accessToken);
        return accessToken;
    } catch (error) {
        // console.log(error);
        throw new ApiError(500,error?.message || "something went wrong during token generation");
    }
}

const getefreshToken = async(user) =>{
    try {
        
        const refreshToken = user.generateRefreshToken();
        if(!refreshToken) throw new ApiError(500,"Refresh Generation Failed");
        await User.findByIdAndUpdate(user._id,{refreshToken});
        return refreshToken;
    } catch (error) {
        // console.log(error);
        throw new ApiError(500,error?.message || "something went wrong during token generation");
    }
}

export {getAccessToken,getefreshToken};