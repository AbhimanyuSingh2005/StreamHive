import { Router } from "express";
import {
    toggleSubscription, 
    getSubscribedChannels, 
    getChannelSubscribers
} from "../controllers/subscription.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";
import {authenticateUser} from "../middlewares/authenticate.middlewares.js";
const router = Router();

router.route("/toggleSubscription/:channelId").post(authenticateUser,toggleSubscription);

router.route("/getSubscribedChannels").get(authenticateUser,getSubscribedChannels);

router.route("/getChannelSubscribers").get(authenticateUser,getChannelSubscribers);

export default router;