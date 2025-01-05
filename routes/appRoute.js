import express from "express";
import {
  deleteApplication,
  employerGetAllApplications,
  jobSeekerGetAllApplication,
  postApplication,
} from "../controllers/appController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post(
  "/post/:id",
  isAuthenticated,
  // isAuthorized("Job Seeker"),
  postApplication
);
router.get(
  "/employer/getall",
  isAuthenticated,
  // isAuthorized("Employer"),
  employerGetAllApplications
);
router.get(
  "/jobseeker/getall",
  isAuthenticated,
  // isAuthorized("Job Seeker"),
  jobSeekerGetAllApplication
);
router.delete("/delete/:id", isAuthenticated, deleteApplication);

export default router;
