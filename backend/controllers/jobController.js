import Job from "../models/Job.js";
import Profile from "../models/Profile.js";

// Create new job
export const createJob = async (req, res) => {
  try {
    const {
      title,
      company,
      description,
      requirements,
      skills,
      location,
      salary,
      jobType,
      category,
      deadline,
    } = req.body;

    if (
      !title ||
      !company ||
      !description ||
      !requirements ||
      !skills ||
      !location ||
      !jobType ||
      !category ||
      !deadline
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required job details",
      });
    }

    const job = await Job.create({
      title,
      company,
      description,
      requirements,
      skills,
      location,
      salary,
      jobType,
      category,
      deadline,
      employer: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Job created successfully",
      job,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all jobs
export const getJobs = async (req, res) => {
  try {
    const { search, location, jobType, category } = req.query;

    const query = { isActive: true };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { skills: { $regex: search, $options: "i" } },
      ];
    }

    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    if (jobType) {
      query.jobType = jobType;
    }

    if (category) {
      query.category = { $regex: category, $options: "i" };
    }

    const jobs = await Job.find(query)
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

// Get single job
export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      "employer",
      "name email role"
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.status(200).json({
      success: true,
      job,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update job
export const updateJob = async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    if (
      job.employer.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to update this job",
      });
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Job updated successfully",
      job,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete job
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    if (
      job.employer.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to delete this job",
      });
    }

    await Job.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get recommended jobs based on job seeker skills
export const getRecommendedJobs = async (req, res) => {
    try {
      const profile = await Profile.findOne({ user: req.user._id });
  
      if (!profile) {
        return res.status(404).json({
          success: false,
          message: "Please create your profile first to get job recommendations",
        });
      }
  
      if (!profile.skills || profile.skills.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Please add skills to your profile",
        });
      }
  
      const jobs = await Job.find({ isActive: true })
        .populate("employer", "name email role")
        .sort({ createdAt: -1 });
  
      const userSkills = profile.skills.map((skill) => skill.toLowerCase());
  
      const recommendedJobs = jobs
        .map((job) => {
          const jobSkills = job.skills.map((skill) => skill.toLowerCase());
  
          const matchedSkills = jobSkills.filter((skill) =>
            userSkills.includes(skill)
          );
  
          const matchPercentage =
            jobSkills.length > 0
              ? Math.round((matchedSkills.length / jobSkills.length) * 100)
              : 0;
  
          return {
            job,
            matchedSkills,
            matchPercentage,
          };
        })
        .filter((item) => item.matchPercentage > 0)
        .sort((a, b) => b.matchPercentage - a.matchPercentage);
  
      res.status(200).json({
        success: true,
        count: recommendedJobs.length,
        recommendedJobs,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
};