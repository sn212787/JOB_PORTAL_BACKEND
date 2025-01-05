import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import {
  getUser,
  Loggedout,
  Login,
  registerUser,
  updatePassword,
  updateProfile,
} from "../controllers/userController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", Login);
router.get("/logout", isAuthenticated, Loggedout);
router.get("/getuser", isAuthenticated, getUser);
router.put("/update/profile", isAuthenticated, updateProfile);
router.put("/update/password", isAuthenticated, updatePassword);


export default router;
