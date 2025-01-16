import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import { v2 as cloudinary } from "cloudinary";
export const createPost = async (req, res) => {
  try {
    const { text } = req.body;
    let { img } = req.body;
    const userId = req.user._id.toString();
    const user = await User.findById(userId);
    if (!user) return res.status(400).json({ message: "User not found" });
    if (!text && !img) {
      return res.status(400).json({ error: "Post must have text or img" });
    }
    if (img) {
      const uploadedResponse = await cloudinary.uploader.upload(img);
      img = uploadedResponse.secure_url;
    }
    const newPost = new Post({
      text: text,
      user: userId,
      img,
    });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    console.log("Error in createPost controller", error.message);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const deletePost = async (req, res)=>{
    try {
        const post = await Post.findById(req.params.id);
        if(!post){
            return res.status(404).json({error:"Post not found"});
        }
        if(post.user.toString() !== req.user._id.toString()){
            return res.status(401).json({error:"You are not authorized to delete this post"})
        }
        if(post.img){
            const imageId = post.img.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(imageId);
        }
        await Post.findByIdAndDelete(req.params.id);
        res.status(200).json({
            message:"Post delete successfully"
        })
    } catch (error) {
        console.log("Error in deletePost controller", error.message);
        res.status(500).json({
            error:"Internal server error"
        })
    }
}