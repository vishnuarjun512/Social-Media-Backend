import express from "express";
import {
  follow,
  likePost,
  unfollow,
  unlikePost,
  comment,
  uncomment,
  getFollowers,
  getFollowing,
  getFollowingPosts,
  getUserPosts,
} from "../controllers/follower.controller.js";

const router = express.Router();

// Followers Actions
router.post("/follow/:userId", follow);
router.post("/unfollow/:userId", unfollow);
router.post("/likePost/:userId", likePost);
router.post("/unlikePost/:userId", unlikePost);
router.post("/comment/:userId", comment);
router.post("/uncomment/:userId", uncomment);

//Followers
router.get("/getFollowers/:userId", getFollowers);
router.get("/getFollowings/:userId", getFollowing);

//Posts
router.get("/getFollowingPosts/:userId", getFollowingPosts);
router.get("/getUserPosts/:userId", getUserPosts);

export default router;
