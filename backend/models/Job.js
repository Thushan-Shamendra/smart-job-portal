import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
    },

    company: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },

    description: {
      type: String,
      required: [true, "Job description is required"],
    },

    requirements: {
      type: String,
      required: [true, "Job requirements are required"],
    },

    skills: {
      type: [String],
      required: true,
    },

    location: {
      type: String,
      required: [true, "Job location is required"],
    },

    salary: {
      type: String,
      default: "Not specified",
    },

    jobType: {
      type: String,
      enum: ["Full-time", "Part-time", "Internship", "Remote", "Contract"],
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    deadline: {
      type: Date,
      required: true,
    },

    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Job = mongoose.model("Job", jobSchema);

export default Job;