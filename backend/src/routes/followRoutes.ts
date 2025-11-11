import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { handleFollow, handleUnfollow, handleFollowers, handleFollowing } from "../controllers/followController";

const router = Router();

router.post("/:userId", authMiddleware, handleFollow);
router.delete("/:userId", authMiddleware, handleUnfollow);
router.get("/:userId/followers", authMiddleware, handleFollowers);
router.get("/:userId/following", authMiddleware, handleFollowing);

export default router;

