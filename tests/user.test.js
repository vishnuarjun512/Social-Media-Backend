import { app, server } from "../index.js";
import request from "supertest";
import mongoose from "mongoose";

let token;
describe("User Tests", () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);
  });
  afterAll(async () => {
    if (server) {
      server.close();
    }
    await mongoose.disconnect();
  });

  const generateFakeData = Math.random().toString(36).substring(2, 6);
  let user;

  test("Registering a New User", async () => {
    const res = await request(app)
      .post("/api/user/register")
      .send({
        username: generateFakeData,
        email: generateFakeData + "@gmail.com",
        password: generateFakeData,
      });
    expect(res.body.message).toBe("Register Success");
    expect(res.statusCode).toBe(200);
  });

  test("Registering Already Registered User", async () => {
    const res = await request(app).post("/api/user/register").send({
      username: "test",
      email: "test@gmail.com",
      password: "test",
    });
    expect(res.body.message).toBe("User already registered");
    expect(res.statusCode).toBe(201);
  });

  test("Logging a Genuine User", async () => {
    const res = await request(app).post("/api/user/login").send({
      username: generateFakeData,
      password: generateFakeData,
    });
    expect(res.body.message).toBe("Login Success");
    expect(res.statusCode).toBe(200);
    user = res.body.user;
    token = res.headers["set-cookie"]
      .find((cookie) => cookie.split("=")[0] === "auth_token")
      .split(";")[0];
  });

  test("Signing off a Logged in User", async () => {
    const res = await request(app).get("/api/user/signout");
    expect(res.body.message).toBe("Signout Success");
    expect(res.statusCode).toBe(200);
  });

  test("Deleting User Account", async () => {
    const res = await request(app).delete(`/api/user/delete/${user._id}`);
    expect(res.body.message).toBe("User Deletion Success");
    expect(res.statusCode).toBe(200);
  });
});

export default token;
