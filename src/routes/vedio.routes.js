import { Router } from "express";
import {
    publishVedio,
    getAllVideos,
    getVedioById,
    updateVedio,
    deleteVedio,
    toogglePublish,
    getUserVedios
} from "../controllers/vedio.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";
import {authenticateUser} from "../middlewares/authenticate.middlewares.js";
const router = Router();

router.route("/publishVedio").post(authenticateUser,upload.fields([
    {
        name : "vedio",
        maxCount : 1
    },
    {
        name : "thumbnail",
        maxCount :1
    }
]),publishVedio);

router.route("/getAllVideos").get(getAllVideos);

router.route("/getVedioById/:vedioId").get( getVedioById);

router.route("/user/:userId").get(getUserVedios);

router.route("/updateVedio").post(authenticateUser,updateVedio);

router.route("/deleteVedio").delete(authenticateUser,deleteVedio);

router.route("/toogglePublish").post(authenticateUser,toogglePublish);

export default router;