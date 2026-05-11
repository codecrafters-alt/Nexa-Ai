import userModel from "../models/user.models.js";
//API for register users
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    //check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await userModel.create({
      name,
      email,
      password,
    });

    //generate jwt token
    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET,
    );

    //save token in cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, //7 days
    });

    res.status(201).json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        credits: user.credits,
      },
      token,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error registering user",
      error: err.message,
    });
  }
};

//api to login user

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    //check if user exists
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email, unauthorized access",
      });
    }

    //check if password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid password, unauthorized access",
      });
    }

    //generate jwt token
    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET,
    );

    //save token in cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, //7 days
    });

    res.status(200).json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        credits: user.credits,
      },
      token,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error logging in user",
      error: err.message,
    });
  }
};
//api to get user data
export const getUser = async (req, res) => {
  try {
    const user = req.user;
    return res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching user data",
      error: err.message,
    });
  }
};
