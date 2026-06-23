import express from "express";
import {
  applyJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
} from "../controllers/applicationController.js";

import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Job seeker routes
router.post(
  "/:jobId/apply",
  protect,
  authorizeRoles("jobseeker"),
  applyJob
);

router.get(
  "/my-applications",
  protect,
  authorizeRoles("jobseeker"),
  getMyApplications
);

// Employer routes
router.get(
  "/job/:jobId",
  protect,
  authorizeRoles("employer", "admin"),
  getJobApplications
);

router.put(
  "/:id/status",
  protect,
  authorizeRoles("employer", "admin"),
  updateApplicationStatus
);

export default router;