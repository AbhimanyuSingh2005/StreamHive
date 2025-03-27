import {asyncHandler} from "../utils/asyncHandler.js";
import {Subscription} from "../models/subscription.models.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";

const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params;
    const userId = req.user._id;
    // console.log(channelId);
    // console.log(userId);

    if(!channelId) throw new ApiError(400, "Channel Id is required");
    if(channelId === userId) throw new ApiError(400, "You can't subscribe to your own channel");

    const subscribed = await Subscription.findOne({channel: channelId, subscriber: userId});
    // console.log(subscribed);
    if(!subscribed){
        const subscription = await Subscription.create({channel: channelId, subscriber: userId});
        return res.status(200).json(new ApiResponse(200, "Subscribed to channel" ,subscription));
    }

    await Subscription.findByIdAndDelete(subscribed._id);
    return res.status(200).json(new ApiResponse(200, "Unsubscribed from channel" ,null));

})

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const subscriptions = await Subscription.aggregate([
        {
            $match: {subscriber: userId}
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channel"
            }
        },
        {
            $unwind: "$channel"
        },
        {
            $project: {
                "channel.username":1,
                "channel.fullName":1,
                "channel.avatar":1,
                "channel.converImage":1
            }
        }
    ])
    return res.status(200).json(new ApiResponse(200,"Subscribed Channel", subscriptions));
})

const getChannelSubscribers = asyncHandler(async (req, res) => {
    const channelId = req.user._id;
    const subscribers = await Subscription.aggregate([
        {
            $match: {channel: channelId}
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriber"
            }
        },
        {
            $unwind: "$subscriber"
        },
        {
            $project: {
                "subscriber.username":1,
                "subscriber.fullName":1,
                "subscriber.avatar":1,
                "subscriber.converImage":1
            }
        }
    ])
    return res.status(200).json(new ApiResponse(200,"Channel Subscribers", subscribers));
})

export {
    toggleSubscription, 
    getSubscribedChannels, 
    getChannelSubscribers
};