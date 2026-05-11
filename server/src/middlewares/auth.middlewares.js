import jwt from "jsonwebtoken";
import userModel from "../models/user.models.js";

export const authenticateUser = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized-token not found, please login" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel
      .findById(decoded.userId)
      .select("-password -__v");
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized-user not found" });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized-Invalid token, please login again",
    });
  }
};
