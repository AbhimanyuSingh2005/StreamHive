import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },
        fullName: {
            type: String,
            required: true,
            trim: true
        },
        avatar: {
            type: String
        },
        coverImage: {
            type: String
        },
        watchHistory: [
            {
                type : Schema.Types.ObjectId,
                ref : "Vedio"
            }
        ],
        password: {
            type: String,
            required: true
        },
        refreshToken: {
            type: String
        }
    },
    {
        timestamps: true
    }
)

mongoose.plugin(mongooseAggregatePaginate);
userSchema.pre("save", async function(next){
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password,10);
        next();
    }
});
userSchema.methods.isPasswordCorrect = async function(){
    return await bcrypt.compare(password, this.password);
}
userSchema.methods.generateAcessToken = function(){
    const accessToken = jwt.sign(
        {
            _id:this._id,
            username: this.username,
            email: this.email,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    );
    return accessToken;
};

userSchema.methods.generateRefreshToken = function(){
    const refreshToken = jwt.sign(
        {
            _id:this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    );
    return refreshToken;
};


export const User = mongoose.model("User", userSchema);