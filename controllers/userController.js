import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/userSchema.js";
import { v2 as cloudinary } from "cloudinary";
import { generateToken } from "../utils/jwtToken.js";


export const registerUser = catchAsyncErrors(async (req, res, next) => {
  try {
    const {
      username,
      email,
      phone,
      password,
      address,
      firstNiche,
      secondNiche,
      thirdNiche,
      coverLetter,
      role,
    } = req.body;

    if (!username || !email || !phone || !password || !role) {
      return next(new ErrorHandler("Please Fill Full Form!", 400));
    }

    if (role === "Job Seeker" && (!firstNiche || !secondNiche || !thirdNiche)) {
      return next(new ErrorHandler("Please Provide Your Neches", 400));
    }

    const isRegistered = await User.findOne({ email });

    if (isRegistered) {
      return next(
        new ErrorHandler("User with this email already registered!", 400)
      );
    }
    const userData = {
      username,
      email,
      phone,
      password,
      address,
      niches: {
        firstNiche,
        secondNiche,
        thirdNiche,
      },
      coverLetter,
      role,
    };

    if (req.files && req.files.resume) {
      const { resume } = req.files;
      if (resume) {
        try {
          const cloudinaryResponce = await cloudinary.uploader.upload(
            resume.tempFilePath,
            {
              folder: "Job_Seeker_Resume",
            }
          );
          if (!cloudinaryResponce || cloudinaryResponce.error) {
            return next(new ErrorHandler("Failed to upload reume", 500));
          }
          userData.resume = {
            public_id: cloudinaryResponce.public_id,
            url: cloudinaryResponce.secure_url,
          };
        } catch (error) {
          return next(new ErrorHandler("Failed to upload reume", 500));
        }
      }
    }
    const user = await User.create(userData);
    generateToken(user, "User Registered", 201, res);
    // res.status(201).json({
    //   success: true,
    //   message: "User Registered!",
    //   user,
    // });
  } catch (error) {
    next(error);
  }
});

export const Login = catchAsyncErrors(async (req, res, next) => {
  const { role, email, password } = req.body;
  if ((!role, !email, !password)) {
    return next(new ErrorHandler("Fields Required to Login!", 400));
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("invalid email or password", 404));
  }

  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Password not Matched!", 404));
  }

  if (user.role !== role) {
    return next(new ErrorHandler("User with this role not Found!", 400));
  }

  generateToken(user, "Logged in successfully!", 201, res);
});

export const Loggedout = catchAsyncErrors(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", "", {
      httpOnly: true,
      expires: new Date(Date.now()),
    })
    .json({
      success: true,
      message: "User Logged out successfully!",
    });
});

export const getUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.find();
  res.status(201).json({
    success: true,
    user,
  });
});

export const updateProfile = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    username: req.body.username,
    email: req.body.email,
    phone: req.body.phone,
    address: req.body.address,
    coverLetter: req.body.coverLetter,
    neches: {
      firstNeche: req.body.firstNeche,
      secondNeche: req.body.secondNeche,
      thirdNeche: req.body.thirdNeche,
    },
    role: req.body.role,
  };

  const { firstNeche, secondNeche, thirdNeche } = newUserData.neches;

  // Validate niches for job seekers
  if (
    req.user.role === "Job Seeker" &&
    (!firstNeche || !secondNeche || !thirdNeche)
  ) {
    return next(new ErrorHandler("Please Select All Your Preferred Niches"));
  }

  // Handle file upload for resume
  if (req.files && req.files.resume) {
    const resume = req.files.resume;

    // Optional: Validate file type
    const allowedTypes = ["application/pdf", "application/msword"];
    if (!allowedTypes.includes(resume.mimetype)) {
      return next(new ErrorHandler("Invalid file type for resume", 400));
    }

    // Delete old resume if exists
    if (req.user.resume && req.user.resume.public_id) {
      await cloudinary.uploader.destroy(req.user.resume.public_id);
    }

    // Upload new resume
    const newResume = await cloudinary.uploader.upload(resume.tempFilePath, {
      folder: "Job_Seeker_Resume",
    });

    newUserData.resume = {
      public_id: newResume.public_id,
      url: newResume.secure_url,
    };
  }

  // Update user in database
  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
  });

  // Send success response
  res.status(200).json({
    success: true,
    message: "Profile Updated!",
    user: user.toObject(),
  });
});

export const updatePassword = catchAsyncErrors(async (req, res, next) => {
  // Ensure req.user.id is set and valid
  if (!req.user || !req.user.id) {
    return next(new ErrorHandler("User not authenticated", 401));
  }

  const { currentPassword, newPassword, confirmPassword } = req.body;

  // Ensure all fields are provided
  if (!currentPassword || !newPassword || !confirmPassword) {
    return next(new ErrorHandler("Please fill out the full form", 400));
  }

  // Find the user by ID and include the password field
  const user = await User.findById(req.user.id).select("+password");
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  // Compare the current password
  const isPasswordMatched = await user.comparePassword(currentPassword);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Incorrect current password", 400));
  }

  // Ensure new and confirm passwords match
  if (newPassword !== confirmPassword) {
    return next(new ErrorHandler("New password does not match confirmation", 400));
  }

  // Update the password and save the user
  user.password = newPassword;
  await user.save();

  // Send success response
  res.status(200).json({
    success: true,
    message: "Password updated successfully!",
  });
});
