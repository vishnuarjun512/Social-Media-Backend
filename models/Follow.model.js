import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const FollowSchema = new mongoose.Schema(
  {
    _id: { type: String, default: uuidv4, required: true },
    userRef: {
      type: String,
      ref: "User",
    },
    followers: [
      {
        type: String,
      },
    ],
    followersCount: {
      type: Number,
    },
    following: [
      {
        type: String,
      },
    ],
    followingCount: {
      type: Number,
    },
  },
  { timestamps: true }
);

const Follow = mongoose.model("Follow", FollowSchema);

export default Follow;
