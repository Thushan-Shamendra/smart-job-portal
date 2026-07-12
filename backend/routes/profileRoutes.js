import express from "express";
import {
  getMyProfile,
  createOrUpdateProfile,
  getProfileByUserId,
  downloadMyProfileCV,
  downloadProfileCVByUserId,
  analyzeProfileCV,
} from "../controllers/profileController.js";

import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import uploadCV from "../middleware/uploadCV.js";

const router = express.Router();

// Job seeker routes
router.get("/me", protect, authorizeRoles("jobseeker"), getMyProfile);

router.post(
  "/analyze-cv",
  protect,
  authorizeRoles("jobseeker"),
  uploadCV.single("cv"),
  analyzeProfileCV
);

router.put(
  "/me",
  protect,
  authorizeRoles("jobseeker"),
  uploadCV.single("cv"),
  createOrUpdateProfile
);

router.get("/me/cv", protect, authorizeRoles("jobseeker"), downloadMyProfileCV);

// Employer/Admin can view applicant profile
router.get(
  "/user/:userId",
  protect,
  authorizeRoles("employer", "admin"),
  getProfileByUserId
);

router.get(
  "/user/:userId/cv",
  protect,
  authorizeRoles("employer", "admin"),
  downloadProfileCVByUserId
);

export default router;
