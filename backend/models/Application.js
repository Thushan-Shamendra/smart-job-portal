import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },

    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    coverLetter: {
      type: String,
      default: "",
    },

    cv: {
        fileId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
      
        filename: {
          type: String,
          required: true,
        },
      
        originalName: {
          type: String,
          required: true,
        },
      
        contentType: {
          type: String,
          required: true,
          enum: [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          ],
        },
      
        size: {
          type: Number,
          required: true,
        },
      },
      
    extractedSkills: {
        type: [String],
        default: [],
    },

    status: {
      type: String,
      enum: ["Pending", "Reviewed", "Shortlisted", "Rejected", "Accepted"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

const Application = mongoose.model("Application", applicationSchema);

export default Application;