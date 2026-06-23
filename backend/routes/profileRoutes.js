import express from "express";
import {
  getMyProfile,
  createOrUpdateProfile,
  getProfileByUserId,
} from "../controllers/profileController.js";

import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Job seeker routes
router.get("/me", protect, authorizeRoles("jobseeker"), getMyProfile);

router.put("/me", protect, authorizeRoles("jobseeker"), createOrUpdateProfile);

// Employer/Admin can view applicant profile
router.get(
  "/user/:userId",
  protect,
  authorizeRoles("employer", "admin"),
  getProfileByUserId
);

export default router;