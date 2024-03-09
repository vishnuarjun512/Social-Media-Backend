import express from "express";
import {
  loginUser,
  registerUser,
  signout,
  getUser,
  updateUser,
  deleteUser,
  getAllUsers,
} from "../controllers/user.controller.js";
import { verifyUser } from "../utils/verifyUser.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/register", registerUser);
router.put("/updateUser/:userId", verifyUser, updateUser);
router.delete("/delete/:userId", deleteUser);
router.get("/getUser/:userId", getUser);
router.get("/getUsers/:userId", getAllUsers);
router.get("/signout/:userId", signout);

export default router;
