import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Like } from "../models/like.models.js";
import { Vedio } from "../models/vedio.models.js";
import { Comment } from "../models/comment.models.js";
import mongoose from "mongoose";

const toggleVedioLike = asyncHandler(async (req, res) => {
    const { vedioId } = req.params;
    const userId = req.user._id;

    if (!mongoose.isValidObjectId(vedioId)) {
        throw new ApiError(400, "Invalid vedioId");
    }

    const vedio = await Vedio.findById(vedioId);
    if (!vedio) {
        throw new ApiError(404, "Vedio not found");
    }

    const like = await Like.findOne({ video: vedioId, likedBy: userId });

    if (like) {
        await Like.findByIdAndDelete(like._id);
        return res.status(200).json(new ApiResponse(200, "Like removed", { isLiked: false }));
    } else {
        await Like.create({ video: vedioId, likedBy: userId });
        return res.status(201).json(new ApiResponse(201, "Like added", { isLiked: true }));
    }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user._id;

    if (!mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid commentId");
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    const like = await Like.findOne({ comment: commentId, likedBy: userId });

    if (like) {
        await Like.findByIdAndDelete(like._id);
        return res.status(200).json(new ApiResponse(200, "Like removed", { isLiked: false }));
    } else {
        await Like.create({ comment: commentId, likedBy: userId });
        return res.status(201).json(new ApiResponse(201, "Like added", { isLiked: true }));
    }
});

const getLikedVedios = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const likedVedios = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(userId),
                video: { $exists: true }
            }
        },
        {
            $lookup: {
                from: "vedios",
                localField: "video",
                foreignField: "_id",
                as: "video",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "onwer",
                            foreignField: "_id",
                            as: "owner"
                        }
                    },
                    {
                        $unwind: "$owner"
                    },
                    {
                        $project: {
                            title: 1,
                            thumbnail: 1,
                            duration: 1,
                            views: 1,
                            createdAt: 1,
                            "owner.username": 1,
                            "owner.avatar": 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$video"
        },
        {
            $replaceRoot: { newRoot: "$video" }
        }
    ]);

    return res.status(200).json(new ApiResponse(200, "Liked vedios retrieved successfully", likedVedios));
});

const getVedioLikeDetails = asyncHandler(async (req, res) => {
    const { vedioId } = req.params;
    const userId = req.user?._id;

    if (!mongoose.isValidObjectId(vedioId)) {
        throw new ApiError(400, "Invalid vedioId");
    }

    const likeCount = await Like.countDocuments({ video: vedioId });
    
    let isLiked = false;
    if (userId) {
        const userLike = await Like.findOne({ video: vedioId, likedBy: userId });
        if (userLike) {
            isLiked = true;
        }
    }

    res.status(200).json(new ApiResponse(200, "Like details retrieved successfully", { likeCount, isLiked }));
});

export {
    toggleVedioLike,
    toggleCommentLike,
    getLikedVedios,
    getVedioLikeDetails
}