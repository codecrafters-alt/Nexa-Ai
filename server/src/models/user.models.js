import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    credits: {
      type: Number,
      default: 50,
    },
  },
  { timestamps: true },
);

//Hash password before storing in database
//het mongoose, before saving any user document, run this function.
//you're attaching a middleware (hook) to the schema before turning it into a model.
userSchema.pre("save", async function () {
  const user = this;
  if (!user.isModified("password")) return; //Only hash password when it's changed and prevent re-hashing already hashed passwords
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const userModel = mongoose.model("User", userSchema);
export default userModel;
