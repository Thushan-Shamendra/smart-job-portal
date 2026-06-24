import User from "../models/User.js";
import Job from "../models/Job.js";
import Application from "../models/Application.js";

// Admin dashboard stats
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalJobSeekers = await User.countDocuments({ role: "jobseeker" });
    const totalEmployers = await User.countDocuments({ role: "employer" });
    const totalAdmins = await User.countDocuments({ role: "admin" });

    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ isActive: true });
    const totalApplications = await Application.countDocuments();

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalJobSeekers,
        totalEmployers,
        totalAdmins,
        totalJobs,
        activeJobs,
        totalApplications,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Activate or deactivate user
export const updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User status updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "Admin cannot delete own account",
      });
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all jobs for admin
export const getAllJobsForAdmin = async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate("employer", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete job by admin
export const deleteJobByAdmin = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Job deleted successfully by admin",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all applications
export const getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate("job", "title company location jobType")
      .populate("applicant", "name email role")
      .populate("employer", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};