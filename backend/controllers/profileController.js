import Profile from "../models/Profile.js";
import { analyzeCV } from "../services/cvAnalysisService.js";
import {
  deleteCVFromGridFS,
  getCVDownloadStream,
  uploadCVToGridFS,
} from "../services/cvStorageService.js";

const parseArrayField = (value, fallback = []) => {
  if (!value) {
    return fallback;
  }

  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : fallback;
    } catch {
      return fallback;
    }
  }

  return fallback;
};

const setCVDownloadHeaders = (res, cv) => {
  const encodedFilename = encodeURIComponent(cv.originalName || "profile-cv");

  res.setHeader("Content-Type", cv.contentType || "application/octet-stream");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename*=UTF-8''${encodedFilename}`
  );
};

const streamProfileCV = async (res, profile) => {
  if (!profile?.cv?.fileId) {
    return res.status(404).json({
      success: false,
      message: "CV not found",
    });
  }

  setCVDownloadHeaders(res, profile.cv);

  const downloadStream = getCVDownloadStream(profile.cv.fileId);

  downloadStream.on("error", (error) => {
    console.error("Profile CV download error:", error);

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to download CV",
      });
    }

    res.end();
  });

  downloadStream.pipe(res);
};

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
      headline = "",
      bio = "",
      location = "",
      portfolioUrl = "",
      githubUrl = "",
      linkedinUrl = "",
    } = req.body;

    const skills = parseArrayField(req.body.skills);
    const education = parseArrayField(req.body.education);
    const experience = parseArrayField(req.body.experience);

    const existingProfile = await Profile.findOne({ user: req.user._id });

    const profileData = {
      user: req.user._id,
      headline,
      bio,
      location,
      skills,
      education,
      experience,
      portfolioUrl,
      githubUrl,
      linkedinUrl,
    };

    if (req.file) {
      const storedCV = await uploadCVToGridFS(req.file, req.user._id.toString());

      if (existingProfile?.cv?.fileId) {
        try {
          await deleteCVFromGridFS(existingProfile.cv.fileId);
        } catch (deleteError) {
          console.error("Old profile CV delete error:", deleteError);
        }
      }

      profileData.cv = {
        fileId: storedCV.fileId,
        filename: storedCV.filename,
        originalName: storedCV.originalName,
        contentType: storedCV.contentType,
        size: storedCV.size,
      };
    }

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

export const analyzeProfileCV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload your CV",
      });
    }

    const analysis = await analyzeCV(req.file);

    return res.status(200).json({
      success: true,
      message: "Skills extracted successfully",
      extractedSkills: analysis.skills,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const downloadMyProfileCV = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    return streamProfileCV(res, profile);
  } catch (error) {
    return res.status(500).json({
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

export const downloadProfileCVByUserId = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.params.userId });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    return streamProfileCV(res, profile);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
