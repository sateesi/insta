import { Router } from "express";
import { body } from "express-validator";
import { authMiddleware } from "../middleware/auth";
import { handleAddComment, handleListComments } from "../controllers/commentController";

const router = Router({ mergeParams: true });

router.get("/:postId", authMiddleware, handleListComments);
router.post(
  "/:postId",
  authMiddleware,
  [body("text").isLength({ min: 1, max: 280 })],
  handleAddComment
);

export default router;

