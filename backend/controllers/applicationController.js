import Application from "../models/Application.js";
import Job from "../models/Job.js";

import {
    uploadCVToGridFS,
    deleteCVFromGridFS,
    getCVDownloadStream,
  } from "../services/cvStorageService.js";

import { analyzeCV } from "../services/cvAnalysisService.js";

// Job seeker: apply for a job
export const applyJob = async (req, res) => {
  let storedCV = null;

  try {
    const { jobId } = req.params;
    const { coverLetter } = req.body;
    const applicantId = req.user._id;

    // Validate CV upload
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload your CV",
      });
    }

    // Validate cover letter
    if (!coverLetter || !coverLetter.trim()) {
      return res.status(400).json({
        success: false,
        message: "Cover letter is required",
      });
    }

    // Check whether the job exists
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Check whether the job is active
    if (!job.isActive) {
      return res.status(400).json({
        success: false,
        message: "This job is not active",
      });
    }

    // Check whether the user has already applied
    const alreadyApplied = await Application.findOne({
      job: jobId,
      applicant: applicantId,
    });

    if (alreadyApplied) {
      return res.status(400).json({
        success: false,
        message: "You have already applied for this job",
      });
    }

    // Extract text and skills from the CV using Groq
    const analysis = await analyzeCV(req.file);

    // Store the actual CV in MongoDB GridFS
    storedCV = await uploadCVToGridFS(req.file, applicantId);

    // Save application information
    const application = await Application.create({
      job: jobId,
      applicant: applicantId,
      employer: job.employer,
      coverLetter: coverLetter.trim(),

      cv: {
        fileId: storedCV.fileId,
        filename: storedCV.filename,
        originalName: storedCV.originalName,
        contentType: storedCV.contentType,
        size: storedCV.size,
      },

      extractedSkills: analysis.skills,
    });

    return res.status(201).json({
      success: true,
      message: "Job application submitted successfully",
      application,
      extractedSkills: analysis.skills,
    });
  } catch (error) {
    // Delete the CV if it was stored but application creation failed
    if (storedCV?.fileId) {
      try {
        await deleteCVFromGridFS(storedCV.fileId);
      } catch (deleteError) {
        console.error("CV cleanup error:", deleteError);
      }
    }

    console.error("Apply job error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to submit job application",
    });
  }
};

// Job seeker: get my applications
export const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({
      applicant: req.user._id,
    })
      .populate(
        "job",
        "title company location salary jobType category deadline"
      )
      .populate("employer", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Employer: get applications for one job
export const getJobApplications = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);

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
        message: "You are not allowed to view these applications",
      });
    }

    const applications = await Application.find({
      job: jobId,
    })
      .populate("applicant", "name email phone role")
      .populate("job", "title company location jobType")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Employer: update application status
export const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatus = [
      "Pending",
      "Reviewed",
      "Shortlisted",
      "Rejected",
      "Accepted",
    ];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application status",
      });
    }

    const application = await Application.findById(
      req.params.id
    ).populate("job");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    if (
      application.job.employer.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to update this application",
      });
    }

    application.status = status;
    await application.save();

    return res.status(200).json({
      success: true,
      message: "Application status updated successfully",
      application,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Download an applicant's CV
export const downloadApplicationCV = async (req, res) => {
    try {
      const application = await Application.findById(req.params.id);
  
      if (!application) {
        return res.status(404).json({
          success: false,
          message: "Application not found",
        });
      }
  
      if (!application.cv?.fileId) {
        return res.status(404).json({
          success: false,
          message: "CV file not found",
        });
      }
  
      const currentUserId = req.user._id.toString();
  
      const isApplicant =
        application.applicant.toString() === currentUserId;
  
      const isEmployer =
        application.employer.toString() === currentUserId;
  
      const isAdmin = req.user.role === "admin";
  
      if (!isApplicant && !isEmployer && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: "You are not allowed to download this CV",
        });
      }
  
      const downloadStream = getCVDownloadStream(
        application.cv.fileId
      );
  
      const encodedFilename = encodeURIComponent(
        application.cv.originalName || "candidate-cv"
      );
  
      res.setHeader(
        "Content-Type",
        application.cv.contentType || "application/octet-stream"
      );
  
      res.setHeader(
        "Content-Disposition",
        `attachment; filename*=UTF-8''${encodedFilename}`
      );
  
      downloadStream.on("error", (error) => {
        console.error("CV download error:", error);
  
        if (!res.headersSent) {
          return res.status(404).json({
            success: false,
            message: "CV file was not found in storage",
          });
        }
  
        res.destroy(error);
      });
  
      downloadStream.pipe(res);
    } catch (error) {
      console.error("Download CV error:", error);
  
      if (!res.headersSent) {
        return res.status(500).json({
          success: false,
          message: error.message,
        });
      }
  
      res.destroy(error);
    }
};