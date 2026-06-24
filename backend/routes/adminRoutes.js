import express from "express";
import {
  getDashboardStats,
  getAllUsers,
  updateUserStatus,
  deleteUser,
  getAllJobsForAdmin,
  deleteJobByAdmin,
  getAllApplications,
} from "../controllers/adminController.js";

import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes only for admin
router.use(protect);
router.use(authorizeRoles("admin"));

router.get("/dashboard", getDashboardStats);

router.get("/users", getAllUsers);
router.put("/users/:id/status", updateUserStatus);
router.delete("/users/:id", deleteUser);

router.get("/jobs", getAllJobsForAdmin);
router.delete("/jobs/:id", deleteJobByAdmin);

router.get("/applications", getAllApplications);

export default router;