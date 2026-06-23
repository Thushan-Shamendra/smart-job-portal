import Profile from "../models/Profile.js";

// Get logged-in job seeker's profile
export const getMyProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id }).populate(
      "user",
      "name email role phone"
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create or update profile
export const createOrUpdateProfile = async (req, res) => {
  try {
    const {
      headline,
      bio,
      location,
      skills,
      education,
      experience,
      cvUrl,
      portfolioUrl,
      githubUrl,
      linkedinUrl,
    } = req.body;

    const profileData = {
      user: req.user._id,
      headline,
      bio,
      location,
      skills,
      education,
      experience,
      cvUrl,
      portfolioUrl,
      githubUrl,
      linkedinUrl,
    };

    const profile = await Profile.findOneAndUpdate(
      { user: req.user._id },
      profileData,
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    ).populate("user", "name email role phone");

    res.status(200).json({
      success: true,
      message: "Profile saved successfully",
      profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Employer/Admin: view applicant profile
export const getProfileByUserId = async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.userId,
    }).populate("user", "name email role phone");

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};