import User from "../models/user.model.js";

export const getUserProfile = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    console.log("Error in getUserProfile controller", error.message);
    return res.status(500).json({ error: "Internal server Error!" });
  }
};

export const followUnfollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userToModify = await User.findById(id);
    const currentUser = await User.findById(req.user._id);
    if (id === req.user._id) {
      return res
        .status(400)
        .json({ error: "You cant follow/unfollow yourself" });
    }
    if(!userToModify || !currentUser) return res.status(400).json({error:"user not found"});
    const isFollowing = currentUser.following.includes(id);
    if(isFollowing){
        //unfollow the user
    } else{
        //follow the user
        await User.findByIdAndUpdate(id,{$push: {followers: req.user_id}});
        await User.findByIdAndUpdate(req.user._id,{$push:{followers: id} });
        //send the notification to the user
    }

  } catch (error) {
    console.log("Error in followUnfollowUser controller", error.message);
    return res.status(500).json({ error: "Internal server Error!" });
  }
};
