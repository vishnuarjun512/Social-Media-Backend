import { app, server } from "../index.js";
import request from "supertest";
import mongoose from "mongoose";

let token, user1, user2;

const generateFakeData = Math.random().toString(36).substring(2, 6);

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const loginResponse = await request(app).post(`/api/user/login/`).send({
    username: "test",
    password: "test",
  });
  user1 = loginResponse.body.user;
  token = loginResponse.headers["set-cookie"]
    .find((cookie) => cookie.split("=")[0] === "auth_token")
    .split(";")[0];

  const registerNewUser = await request(app)
    .post(`/api/user/register`)
    .send({
      username: generateFakeData,
      email: generateFakeData + "@gmail.com",
      password: generateFakeData,
    });

  const loginResponse2 = await request(app).post(`/api/user/login`).send({
    username: generateFakeData,
    password: generateFakeData,
  });
  user2 = loginResponse2.body.user;
});
afterAll(async () => {
  if (server) {
    const res = await request(app).delete(`/api/user/delete/${user2._id}`);
    server.close();
  }
  await mongoose.disconnect();
});

describe("Follow and Unfollow", () => {
  test("Follow A User", async () => {
    const res = await request(app)
      .post(`/api/follower/follow/${user1._id}`)
      .set("Cookie", token)
      .send({
        toFollow: user2._id,
      });
    expect(res.body.message).toBe("Followed Success");
    expect(res.statusCode).toBe(200);
    expect(res.body.followedUser.followers).toBeDefined();
  });

  test("Unfollow A User", async () => {
    const res = await request(app)
      .post(`/api/follower/unfollow/${user1._id}`)
      .set("Cookie", token)
      .send({
        toUnfollow: user2._id,
      });
    expect(res.body.message).toBe("Unfollowed Success");
    expect(res.statusCode).toBe(200);
  });
});

describe("Get Followers and Following", () => {
  test("Get All Followers", async () => {
    const res = await request(app)
      .get(`/api/follower/getFollowers/${user1._id}`)
      .set("Cookie", token);

    const followers = res.body.data;

    if (followers.length == 0) {
      expect(res.body.message).toBe("No Followers");
    } else {
      expect(res.body.message).toBe("Followers Found");
    }
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toBeDefined();
  });

  test("Get All Following", async () => {
    const res = await request(app)
      .get(`/api/follower/getFollowings/${user1._id}`)
      .set("Cookie", token);

    const following = res.body.data;

    if (following.length == 0) {
      expect(res.body.message).toBe("No Following");
    } else {
      expect(res.body.message).toBe("Followings Found");
    }
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toBeDefined();
  });
});

describe("Get Posts", () => {
  test("Get All Following Posts", async () => {
    // User2 follows User1(test) so that user2 gets all the recent posts of this following
    const follow = await request(app)
      .post(`/api/follower/follow/${user2._id}`)
      .set("Cookie", token)
      .send({
        toFollow: user1._id,
      });

    const res = await request(app)
      .get(`/api/follower/getFollowingPosts/${user2._id}`)
      .set("Cookie", token);

    const posts = res.body.data;

    if (posts.length == 0) {
      expect(res.body.message).toBe("No Posts");
    } else {
      expect(res.body.message).toBe("All Posts");
    }
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toBeDefined();
  });

  test("Get User Posts Only", async () => {
    const res = await request(app)
      .get(`/api/follower/getUserPosts/${user1._id}`)
      .set("Cookie", token);

    const posts = res.body.data;

    if (posts.length == 0) {
      expect(res.body.message).toBe("No Posts");
    } else {
      expect(res.body.message).toBe("All Posts");
    }
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toBeDefined();
  });
});

export default token;
