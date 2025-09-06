import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Comment } from "../models/comment.models.js";
import { Vedio } from "../models/vedio.models.js";
import mongoose from "mongoose";

const getVideoComments = asyncHandler(async (req, res) => {
    const { vedioId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!mongoose.isValidObjectId(vedioId)) {
        throw new ApiError(400, "Invalid vedioId");
    }

    const vedio = await Vedio.findById(vedioId);
    if (!vedio) {
        throw new ApiError(404, "Vedio not found");
    }

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
    };

    const comments = await Comment.aggregatePaginate(
        Comment.aggregate([
            {
                $match: {
                    video: new mongoose.Types.ObjectId(vedioId)
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "owner"
                }
            },
            {
                $unwind: "$owner"
            },
            {
                $project: {
                    content: 1,
                    createdAt: 1,
                    "owner.username": 1,
                    "owner.avatar": 1
                }
            }
        ]),
        options
    );

    return res.status(200).json(new ApiResponse(200, "Comments retrieved successfully", comments));
});

const addComment = asyncHandler(async (req, res) => {
    const { vedioId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    if (!mongoose.isValidObjectId(vedioId)) {
        throw new ApiError(400, "Invalid vedioId");
    }

    if (!content) {
        throw new ApiError(400, "Content is required");
    }

    const vedio = await Vedio.findById(vedioId);
    if (!vedio) {
        throw new ApiError(404, "Vedio not found");
    }

    const comment = await Comment.create({
        content,
        video: vedioId,
        owner: userId
    });

    return res.status(201).json(new ApiResponse(201, "Comment added successfully", comment));
});

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    if (!mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid commentId");
    }

    if (!content) {
        throw new ApiError(400, "Content is required");
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    if (comment.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "You are not authorized to update this comment");
    }

    comment.content = content;
    await comment.save();

    return res.status(200).json(new ApiResponse(200, "Comment updated successfully", comment));
});

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user._id;

    if (!mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid commentId");
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    if (comment.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "You are not authorized to delete this comment");
    }

    await Comment.findByIdAndDelete(commentId);

    return res.status(200).json(new ApiResponse(200, "Comment deleted successfully", {}));
});


export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}