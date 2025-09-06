import { Router } from 'express';
import {
    getLikedVedios,
    toggleCommentLike,
    toggleVedioLike,
    getVedioLikeDetails
} from '../controllers/like.controllers.js';
import {authenticateUser} from "../middlewares/authenticate.middlewares.js";

const router = Router();
router.use(authenticateUser); // Apply authenticateUser middleware to all routes in this file

router.route("/toggle/v/:vedioId").post(toggleVedioLike);
router.route("/toggle/c/:commentId").post(toggleCommentLike);
router.route("/vedios").get(getLikedVedios);
router.route("/details/v/:vedioId").get(getVedioLikeDetails);

export default router;