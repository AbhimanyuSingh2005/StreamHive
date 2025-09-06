import { Router } from "express";
import {
    addComment,
    deleteComment,
    getVideoComments,
    updateComment
} from "../controllers/comment.controllers.js";
import { authenticateUser } from "../middlewares/authenticate.middlewares.js";

const router = Router();

router.use(authenticateUser);

router.route("/:vedioId")
    .get(getVideoComments)
    .post(addComment);

router.route("/c/:commentId")
    .patch(updateComment)
    .delete(deleteComment);

export default router;