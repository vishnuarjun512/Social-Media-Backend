import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const PostSchema = new mongoose.Schema(
  {
    _id: { type: String, default: uuidv4, required: true },
    userRef: {
      type: String,
      ref: "User",
    },
    content: {
      type: String,
      required: [true, "Please enter Content for the Post"],
      minlength: [10, "Content must be at least 10 characters long"],
      maxlength: [1000, "Content cannot exceed 1000 characters"],
    },
    likes: [
      {
        type: String,
        ref: "User",
      },
    ],
    likesCount: {
      type: Number,
      default: 0,
      min: [0, "Likes count cannot be negative"],
    },
    comments: [
      {
        userId: {
          type: String,
          ref: "User",
          required: true,
        },
        comment: {
          type: String,
          required: true,
        },
      },
    ],
    commentsCount: {
      type: Number,
      default: 0,
      min: [0, "Comments count cannot be negative"],
    },
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", PostSchema);

export default Post;
