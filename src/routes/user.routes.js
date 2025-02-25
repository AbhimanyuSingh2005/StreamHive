import { Router } from "express";
import {registerUser,loginUser,logoutUser,refreshAccessAndRefreshToken} from "../controllers/user.controllers.js";
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

router.route("/refreshToken".post(refreshAccessAndRefreshToken));

export default router;