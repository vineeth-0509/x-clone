import z from "zod";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";

const signupSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  email: z.string().email("Invalid email address"),
});

export const signup = async (req, res) => {
  try {
    const data = signupSchema.parse(req.body); // Validate input

    const existingUser = await User.findOne({
      where: { username: data.username },
    });
    if (existingUser) {
      return res.status(400).json({ error: "Username is already taken" });
    }

    const existingEmail = await User.findOne({
      where: { email: data.email },
    });
    if (existingEmail) {
      return res.status(400).json({ message: "Email is already taken" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt); // Added await
    const newUser = new User({
      fullName: data.fullName,
      username: data.username,
      email: data.email,
      password: hashedPassword,
    });

    if (newUser) {
      generateTokenAndSetCookie(newUser._id, res);
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
    } else {
      return res.status(400).json({ error: "Invalid user data" });
    }
  } catch (error) {
    console.error("Error in signup controller:", error.message);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors }); // Return Zod validation errors
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({
      username
    });
    const isPassword = await bcrypt.compare(password, user?.password || "");
    if (!user || !password) {
      return res.status(400).json({
        error: "Invalid username or password",
      });
    }
    generateTokenAndSetCookie(user._id, res);
    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      followers: user.followers,
      following: user.following,
      profileImg: user.profileImg,
      coverImg: user.coverImg,
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ error: "Internal server Error" });
  }
};


export const logout = async (req, res)=>{
  try {
    res.cookie("jwt",{maxAge: 0})
    res.status(200).json({message:"Logged out successfully"})
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({
      error:"Internal server error"
    })
  }
}