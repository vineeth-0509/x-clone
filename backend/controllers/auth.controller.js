import z from "zod";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
const signupSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  username: z.string().min(1, "Username is requried"),
  password: z.string().min(6, "Password must be atleast 6 characters long"),
  email: z.string().email("Invalid email address"),
});
export const signup = async (req, res) => {
  try {
    const data = signupSchema.parse(req.body);
    const existingUser = await User.findOne({
      where: {
        username: data.username,
      },
    });
    if (existingUser) {
      return res.status(400).json({ error: "Username is already taken" });
    }

    const existingEmail = await User.findOne({
      where: {
        email: data.email,
      },
    });
    if (existingEmail) {
      return req.status(400).json({
        Message: "Email is already taken",
      });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = bcrypt.hash(data.password, salt);
    const newUser = new User({
      fullName: data.fullName,
      username: data.username,
      email: data.email,
      password: hashedPassword,
    });
    if (newUser) {
      generateJwtCookie(newUser._id, res);
      await newUser.save();
      res.status(200).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        username: newUser.username,
        email: newUser.email,
        followers: newUser.followers,
        following: newUser.following,
        profileImg: newUser.profileImg,
        coverImg: newUser.coverImg,
      });
    } else{
        return res.status(400).json({error:"Invalid user data"});
    }
  } catch (error) {
    console.log("Error in signup controller", error.message)
    res.status(500).json({error:"Internal server Error"})
  }
};
export const login = async (req, res) => {};
export const logout = async (req, res) => {};
