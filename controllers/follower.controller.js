import User from "../models/User.model.js";
import Follow from "../models/Follow.model.js";
import Post from "../models/Post.model.js";

export const createFollowIfNotExists = async (id) => {
  try {
    // To check if the User already following or not
    const checkFollowExists = await Follow.findOne({ userRef: id });
    if (!checkFollowExists) {
      const res = await Follow.create({ userRef: id });
    }
  } catch (error) {
    console.log(error);
  }
};

export const follow = async (req, res) => {
  try {
    const userId = req.params.userId;
    const toFollow = req.body.toFollow;

    await Promise.all([
      createFollowIfNotExists(userId),
      createFollowIfNotExists(toFollow),
    ]);

    const checkFollowing = await Follow.findOne({ userRef: userId });
    if (
      checkFollowing.following &&
      Array.isArray(checkFollowing.following) &&
      checkFollowing.following.includes(toFollow)
    ) {
      return res
        .status(201)
        .json({ error: true, message: "Already Following" });
    }

    const mainUser = await Follow.findOneAndUpdate(
      { userRef: userId },
      {
        $push: { following: toFollow },
        $inc: { followingCount: 1 },
      },
      { new: true }
    );

    const secondUser = await Follow.findOneAndUpdate(
      { userRef: toFollow },
      {
        $push: { followers: userId },
        $inc: { followersCount: 1 },
      },
      { new: true }
    );

    return res.status(200).json({
      error: false,
      message: "Followed Success",
      followedUser: secondUser,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ error: true, message: "Internal Server Error" });
  }
};

export const unfollow = async (req, res) => {
  try {
    const userId = req.params.userId;
    const toUnfollow = req.body.toUnfollow;

    const checkFollowing = await Follow.findOne({ userRef: userId });

    // Checking if checkFollowing.following exists and is an array
    if (!checkFollowing || !checkFollowing.following.includes(toUnfollow)) {
      return res.status(401).json({
        error: true,
        message: "Not Following the User or Server Error",
      });
    }

    const mainUser = await Follow.findOneAndUpdate(
      { userRef: userId },
      {
        $pull: { following: toUnfollow },
        $inc: { followingCount: -1 },
      },
      { new: true }
    );

    const secondUser = await Follow.findOneAndUpdate(
      { userRef: toUnfollow },
      {
        $pull: { followers: userId },
        $inc: { followersCount: -1 },
      },
      { new: true }
    );

    return res.status(200).json({
      error: false,
      message: "Unfollowed Success",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

export const likePost = async (req, res) => {
  try {
    const postId = req.body.postId;
    const userId = req.params.userId;

    // Check if the post exists
    const post = await Post.findOne({ _id: postId });
    if (!post) {
      return res.status(201).json({ error: true, message: "Post not found" });
    }

    // Check if the user already liked the post
    if (post.likes.includes(userId)) {
      return res
        .status(201)
        .json({ error: true, message: "Already liked the post" });
    }

    // Update the post's likes array
    const updatedPost = await Post.findOneAndUpdate(
      { _id: postId },
      {
        $push: { likes: userId },
        $inc: { likesCount: 1 },
      },
      { new: true }
    );

    return res.status(200).json({
      error: false,
      message: "Post liked successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ error: true, message: "Internal Server Error" });
  }
};

export const unlikePost = async (req, res) => {
  try {
    const postId = req.body.postId;
    const userId = req.params.userId;

    // Check if the post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(201).json({ error: true, message: "Post not found" });
    }

    // Check if the user already liked the post
    if (!post.likes.includes(userId)) {
      return res
        .status(201)
        .json({ error: true, message: "Didnt liked the post" });
    }

    // Update the post's likes array
    const updatedPost = await Post.findOneAndUpdate(
      { _id: postId },
      {
        $pull: { likes: userId },
        $inc: { likesCount: -1 },
      },
      { new: true }
    );

    return res.status(200).json({
      error: false,
      message: "Post unliked successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

export const comment = async (req, res) => {
  try {
    const { postId, comment } = req.body;
    const userId = req.params.userId;

    // Update the post's likes array
    const updatedPost = await Post.findOneAndUpdate(
      { _id: postId },
      {
        $push: {
          comments: {
            userId,
            comment,
          },
        },
        $inc: { commentsCount: 1 },
      },
      { new: true }
    );

    return res.status(200).json({
      error: false,
      message: "Commented successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

export const uncomment = async (req, res) => {
  try {
    const { postId, comment } = req.body;
    const userId = req.params.userId;

    // Update the post's likes array
    const updatedPost = await Post.findOneAndUpdate(
      { _id: postId },
      {
        $pull: {
          comments: { comment },
        },
        $inc: { commentsCount: -1 },
      },
      { new: true }
    );

    return res.status(200).json({
      error: false,
      message: "Uncommented successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

export const getFollowers = async (req, res) => {
  const userId = req.params.userId;
  const limit = parseInt(req.query.limit) || 5;
  const page = parseInt(req.query.page) || 1;

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  try {
    const user = await Follow.findOne({ userRef: userId });
    if (!user) {
      console.log("User not found");
      return res.status(201).json({ error: true, message: "User not found" });
    }
    const followers = user.followers;

    if (followers.length == 0) {
      const limitUsersWhenZero = followers.slice(0, limit);
      return res.status(200).json({
        error: false,
        message: "No Followers",
        data: limitUsersWhenZero,
      });
    }

    const filteredFollowers = followers.slice(startIndex, endIndex);

    return res.status(200).json({
      error: false,
      message: "Followers Found",
      data: filteredFollowers,
    });
  } catch (error) {
    res.status(201).json({ success: false, message: "Internal Server Error" });
  }
};

export const getFollowing = async (req, res) => {
  const userId = req.params.userId;
  const limit = parseInt(req.query.limit) || 5;
  const page = parseInt(req.query.page) || 1;

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  try {
    const user = await Follow.findOne({ userRef: userId });
    if (!user) {
      console.log("User not found");
      return res.status(201).json({ error: true, message: "User not found" });
    }
    const followings = user.following;

    if (followings.length == 0) {
      const limitUsersWhenZero = followings.slice(0, limit);
      return res.status(200).json({
        error: false,
        message: "No Following",
        data: limitUsersWhenZero,
      });
    }

    const filteredFollowings = followings.slice(startIndex, endIndex);

    return res.status(200).json({
      error: false,
      message: "Followings Found",
      data: filteredFollowings,
    });
  } catch (error) {
    res.status(201).json({ success: false, message: "Internal Server Error" });
  }
};

export const getFollowingPosts = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Limiting the number of posts sent using queries
    const limit = parseInt(req.query.limit) || 5;
    const page = parseInt(req.query.page) || 1;

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    // Get the list of users that the current user is following
    const following = await Follow.findOne({ userRef: userId });
    const followedUsers = following.following;

    // Aggregate posts from followed users sorted by most recent
    const posts = await Post.aggregate([
      {
        $match: { userRef: { $in: followedUsers } }, // Match posts by followed users
      },
      {
        $sort: { createdAt: -1 }, // Sort posts by most recent
      },
    ]);

    if (posts.length == 0) {
      return res.status(200).json({
        error: false,
        message: "No Posts",
        data: [],
      });
    } else if (posts.length < limit) {
      return res.status(200).json({
        error: false,
        message: "All Posts",
        data: posts,
      });
    }

    const limitedPosts = posts.slice(startIndex, endIndex);

    res.status(200).json({
      error: false,
      message: "All Posts",
      data: limitedPosts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Limiting the number of posts sent using queries
    const limit = parseInt(req.query.limit) || 5;
    const page = parseInt(req.query.page) || 1;

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const posts = await Post.aggregate([
      { $match: { userRef: userId } }, // Match posts by user
      { $sort: { createdAt: -1 } }, // Sort posts by most recent
      { $skip: startIndex }, // Skip posts for pagination
      { $limit: limit }, // Limit the number of posts per page
    ]);

    if (posts.length == 0) {
      return res.status(200).json({
        error: false,
        message: "No Posts",
        data: [],
      });
    }

    const limitedPosts = posts.slice(startIndex, endIndex);

    res.status(200).json({
      error: false,
      message: "All Posts",
      data: limitedPosts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};
