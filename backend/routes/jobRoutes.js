import express from "express";
import {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
} from "../controllers/jobController.js";

import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getJobs);
router.get("/:id", getJobById);

// Employer routes
router.post("/", protect, authorizeRoles("employer"), createJob);

// Employer or admin routes
router.put("/:id", protect, authorizeRoles("employer", "admin"), updateJob);
router.delete("/:id", protect, authorizeRoles("employer", "admin"), deleteJob);

export default router;