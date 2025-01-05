import express from "express";
import {
  createPost,
  deleteJob,
  getAllJobs,
  getMyJobs,
  getSingleJob,
} from "../controllers/jobController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/post", isAuthenticated, createPost);
router.get("/getall", getAllJobs);
router.get("/getmyjobs", isAuthenticated, getMyJobs);
router.delete(
  "/delete/:id",
  isAuthenticated,
  // isAuthorized("Employer"),
  deleteJob
);
router.get("/get/:id", isAuthenticated, getSingleJob);

export default router;
