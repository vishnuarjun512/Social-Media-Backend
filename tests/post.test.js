import { app, server } from "../index.js";
import request from "supertest";
import mongoose from "mongoose";

let token;
let user;
let post;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const loginResponse = await request(app).post(`/api/user/login/`).send({
    username: "test",
    password: "test",
  });
  user = loginResponse.body.user;
  token = loginResponse.headers["set-cookie"]
    .find((cookie) => cookie.split("=")[0] === "auth_token")
    .split(";")[0];
});
afterAll(async () => {
  if (server) {
    server.close();
  }
  await mongoose.disconnect();
});

describe("Post Creation and Deletion", () => {
  const generateFakeData = Math.random().toString(36).substring(2, 6);

  test("Creating a Post", async () => {
    const res = await request(app)
      .post(`/api/post/create/${user._id}`)
      .set("Cookie", token)
      .send({
        content: "Hello World, Lets make a new Post",
      });
    post = res.body.data;

    expect(res.body.message).toBe("Post Created Successfully");
    expect(res.statusCode).toBe(200);
  });

  test("Deleting a Post", async () => {
    const res = await request(app)
      .delete(`/api/post/deletePost/${post._id}`)
      .set("Cookie", token);
    expect(res.body.message).toBe("Post Deleted Successfully");
    expect(res.statusCode).toBe(200);
  });

  test("Get all Posts made by a User", async () => {
    const res = await request(app)
      .get(`/api/post/getPosts/${user._id}`)
      .set("Cookie", token);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("All Posts Found Successfully");
    expect(res.body.data).toBeDefined();
  });
});

describe("Post Liking and Disliking", () => {
  test("Liking a Post", async () => {
    const create = await request(app)
      .post(`/api/post/create/${user._id}`)
      .set("Cookie", token)
      .send({
        content: "Lets Like this Post",
      });
    post = create.body.data;

    expect(create.body.message).toBe("Post Created Successfully");
    expect(create.statusCode).toBe(200);

    const like = await request(app)
      .post(`/api/follower/likePost/${user._id}`)
      .set("Cookie", token)
      .send({
        postId: post._id,
      });

    expect(like.statusCode).toBe(200);
    expect(like.body.message).toBe("Post liked successfully");
  });

  test("Disliking a Post", async () => {
    const like = await request(app)
      .post(`/api/follower/unlikePost/${user._id}`)
      .set("Cookie", token)
      .send({
        postId: post._id,
      });

    expect(like.statusCode).toBe(200);
    expect(like.body.message).toBe("Post unliked successfully");
  });
});

describe("Post Commenting and Uncommenting", () => {
  test("Commenting on a Post", async () => {
    const create = await request(app)
      .post(`/api/follower/comment/${user._id}`)
      .set("Cookie", token)
      .send({
        postId: post._id,
        comment: "Comment Testing",
      });

    expect(create.body.message).toBe("Commented successfully");
    expect(create.statusCode).toBe(200);
  });

  test("Uncommenting on a Post", async () => {
    const like = await request(app)
      .post(`/api/follower/uncomment/${user._id}`)
      .set("Cookie", token)
      .send({
        postId: post._id,
        comment: "Comment Testing",
      });

    expect(like.statusCode).toBe(200);
    expect(like.body.message).toBe("Uncommented successfully");
  });
});

export default token;
