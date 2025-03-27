import { Router } from "express";
import {registerUser,
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
} from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";
import {authenticateUser} from "../middlewares/authenticate.middlewares.js";
const router = Router();

router.route("/register").post(upload.fields([
    {
        name : "avatar",
        maxCount : 1
    },
    {
        name : "coverImage",
        maxCount :1
    }
]),registerUser);

router.route("/login").post(loginUser);

router.route("/logout").post(authenticateUser,logoutUser);

router.route("/refreshToken").post(refreshAccessAndRefreshToken);

router.route("/updatePassword").post(authenticateUser,updatePassword);

router.route("/getCurrentUser").get(authenticateUser,getCurrentUser);

router.route("/updateUserDetails").post(authenticateUser,updateUserDetails);

router.route("/updateAvatar").post(authenticateUser,upload.single('avatar'),updateAvatar);

router.route("/updateCoverImage").post(authenticateUser,upload.single('coverImage'),updateCoverImage);

router.route("/getChannelProfile/:username").get(getChannelProfile);

router.route("/getWatchHistory").get(authenticateUser,getWatchHistory);

// router.route("/uploadVedio").post(authenticateUser,upload.fields([
//     {
//         name : "vedio",
//         maxCount : 1
//     },
//     {
//         name : "thumbnail",
//         maxCount :1
//     }
// ]),uploadVedio);

export default router;