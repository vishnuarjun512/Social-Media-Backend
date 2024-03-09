import User from "../models/User.model.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

export const loginUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const checkUser = await User.findOne({ $or: [{ username }, { email }] });
    if (!checkUser)
      //If User not found
      return res.status(201).json({ error: true, message: "User not found" });

    //Checking pAssword
    const checkPassword = bcryptjs.compareSync(password, checkUser.password);
    if (!checkPassword)
      return res
        .status(404)
        .json({ error: true, message: "Credentials dont match" });

    //Removing Password from the Response
    const { password: removingPassword, ...rest } = checkUser._doc;
    const token = jwt.sign(
      { userId: checkUser._id, user: rest },
      process.env.JWT_SECRET
    );

    return res
      .cookie("auth_token", token, { httpOnly: true })
      .status(200)
      .json({
        error: false,
        message: "Login Success",
        user: rest,
      });
  } catch (error) {
    console.log(error);
    res.status(404).json({ error: true, message: "Internal Server Error" });
  }
};

export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const data = await User.findOne({ $or: [{ email }, { username }] });

    if (data) {
      return res
        .status(201)
        .json({ error: true, message: "User already registered" });
    }

    const hashedPassword = bcryptjs.hashSync(password, 10);

    // Using uuid for User ID
    const userId = uuidv4();

    const newUser = new User({
      _id: userId,
      email,
      username,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();
    return res
      .status(200)
      .json({ error: false, message: "Register Success", data: savedUser });
  } catch (error) {
    console.log(error);
    return res
      .status(201)
      .json({ error: true, message: "Internal Server Error" });
  }
};

export const signout = async (req, res) => {
  try {
    res
      .cookie("auth_token", "", { maxAge: 0 })
      .status(200)
      .json({ error: false, message: "Signout Success" });
  } catch (error) {
    console.log(error);
    res.status(201).json({ error: true, message: "Signout Success" });
  }
};

export const getUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    return res
      .status(200)
      .json({ error: false, data: user, message: "Retreived User Info" });
  } catch (error) {
    console.log("GetLogged Error -> ", error.message);
    return res
      .status(201)
      .json({ error: true, message: "Get User Server Failed" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const userId = req.params.userId;
    const users = await User.find();
    const filterUsers = users.filter((user) => user._id != userId);
    return res.status(200).json({ error: false, data: filterUsers });
  } catch (error) {
    console.log("GetLogged Error -> ", error.message);
    return res.status(201).json({ message: "Get User Server Failed" });
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.userId;

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      console.log("User Deletion Failed");
      return res
        .status(201)
        .json({ error: true, message: "User Deletion Failed" });
    }

    return res
      .status(200)
      .json({ error: true, message: "User Deletion Success" });
  } catch (error) {
    console.log(error);
    res.status(201).json({
      error: "Account deletion failed",
      message: "Internal server error",
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { username, email, password, profilePicture } = req.body;
    console.log("username password -> ", username, password);

    let updateFields = {};

    //Check if email is changed
    if (email) {
      updateFields.email = email;
    }

    //Check if username is changed
    if (username) {
      updateFields.username = username;
    }

    //Check if profilePicture is changed
    if (profilePicture) {
      updateFields.profilePicture = profilePicture;
    }

    // Check if password is provided
    if (password) {
      // Hash the password
      var hashedPass = bcryptjs.hashSync(password, 10);
      updateFields.password = hashedPass;
    }

    const userCheck = await User.findOneAndUpdate(
      { _id: userId },
      updateFields,
      { new: true } // Return the updated document
    );

    const newToken = jwt.sign(
      { userId: userCheck._id, user: userCheck },
      process.env.JWT_SECRET
    );
    res.cookie("auth_token", newToken, { httpOnly: true });
    console.log("Updated User -> ", userCheck);
    res.status(200).json({
      data: req.body,
      newData: userCheck,
      message: "User Update Success",
    });
  } catch (error) {
    console.log(error);
    res.status(200).json({ error: "User Update Failed" });
  }
};
