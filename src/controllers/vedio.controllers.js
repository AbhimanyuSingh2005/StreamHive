import {asyncHandler} from "../utils/asyncHandler.js";
import {User} from "../models/user.models.js";
import {Vedio} from "../models/vedio.models.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {uploadOnCludinary} from "../utils/cloudinary.js";

const publishVedio = asyncHandler(async(req,res,next)=>{
    
    const vedioLocalPath = req.files?.vedio ? req.files.vedio[0]?.path : null;
    const thumbnailLocalPath = req.files?.thumbnail ? req.files.thumbnail[0]?.path : null;
    const {title,description} = req.body;
    if(!vedioLocalPath) throw new ApiError(401,"Vedio is not uploaded");
    if(!thumbnailLocalPath) throw new ApiError(401,"Thumbnail is not uploaded");
    const uploadedVedio = await uploadOnCludinary(vedioLocalPath);
    const thumbnail = await uploadOnCludinary(thumbnailLocalPath);
    if(!uploadedVedio) throw new ApiError(401,"Vedio upload failed");
    if(!thumbnail) throw new ApiError(401,"Thumbnail upload failed");
    const vedio = await Vedio.create({
        vedioFile : uploadedVedio.url,
        thumbnail : thumbnail.url,
        title,
        description,
        duration : uploadedVedio.duration,
        isPublished : true,
        onwer : req.user._id
    })
    return res.status(200)
    .json(new ApiResponse(200,"new Vedio Uploaded",vedio)); 
})

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortType = 'desc' } = req.query;
    const sortOptions = {};
    sortOptions[sortBy] = sortType === "asc" ? 1 : -1;

    const vedios = await Vedio.find({ isPublished: true })
        .sort(sortOptions)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

    res.status(200).json(new ApiResponse(200, "All vedios", vedios));
})

const getVedioById = asyncHandler(async (req, res) => {
    const vedioId = req.params.vedioId;
    if(!vedioId) throw new ApiError(401,"Vedio Id is required");
    const vedio = await Vedio.findById(vedioId);
    if(!vedio) throw new ApiError(404,"Vedio not found");
    res.status(200).json(new ApiResponse(200, "Vedio", vedio));
})

const updateVedio = asyncHandler(async (req, res) => {
    const vedioId = req.query.vedioId;
    const userId = req.user._id;
    if(!vedioId) throw new ApiError(401,"Vedio Id is required");
    const vedio = await Vedio.findById(vedioId);
    if (!userId.equals(vedio.onwer)) throw new ApiError(401, "You are not authorized to update this vedio");
    
    if(!vedio) throw new ApiError(404,"Vedio not found");
    const {title,description} = req.body;
    if(title) vedio.title = title;
    if(description) vedio.description = description;
    await vedio.save();
    res.status(200).json(new ApiResponse(200, "Vedio Updated", vedio));
})

const deleteVedio = asyncHandler(async (req, res) => {
    const vedioId = req.query.vedioId;
    const userId = req.user._id;
    if(!vedioId) throw new ApiError(401,"Vedio Id is required");
    const vedio = await Vedio.findById(vedioId);
    if(!userId.equals(vedio.onwer)) throw new ApiError(401,"You are not authorized to delete this vedio");
    
    if(!vedio) throw new ApiError(404,"Vedio not found");
    await Vedio.findByIdAndDelete(vedioId);
    res.status(200).json(new ApiResponse(200, "Vedio Deleted", null));
})

const toogglePublish = asyncHandler(async (req, res) => {
    const vedioId = req.query.vedioId;
    const userId = req.user._id;
    if(!vedioId) throw new ApiError(401,"Vedio Id is required");
    const vedio = await Vedio.findById(vedioId);
    
    if(!userId.equals(vedio.onwer)) throw new ApiError(401,"You are not authorized to update this vedio");
    
    if(!vedio) throw new ApiError(404,"Vedio not found");
    vedio.isPublished = !vedio.isPublished;
    await vedio.save();
    res.status(200).json(new ApiResponse(200, "Vedio Updated", vedio));
})

export {
    publishVedio,
    getAllVideos,
    getVedioById,
    updateVedio,
    deleteVedio,
    toogglePublish
}
