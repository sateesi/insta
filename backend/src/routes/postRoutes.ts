import { Router } from "express";
import multer from "multer";
import { body } from "express-validator";
import { handleCreatePost, handleFeed, handleProfilePosts } from "../controllers/postController";
import { authMiddleware } from "../middleware/auth";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/feed", authMiddleware, handleFeed);
router.get("/user/:userId", authMiddleware, handleProfilePosts);

router.post(
  "/",
  authMiddleware,
  upload.single("image"),
  [body("caption").isLength({ min: 1, max: 280 })],
  handleCreatePost
);

export default router;

