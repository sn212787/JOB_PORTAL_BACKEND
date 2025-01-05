import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { Application } from "../models/applicationSchema.js";
import { Job } from "../models/postSchema.js";
import { v2 as cloudinary } from "cloudinary";


export const postApplication = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params; // Job ID
  const { name, email, phone, coverLetter, address } = req.body;

  // Validate required fields
  if (!name || !email || !phone || !coverLetter || !address) {
    return next(new ErrorHandler("All fields are required!", 400));
  }

  // Validate job details
  const jobDetails = await Job.findById(id);
  if (!jobDetails) {
    return next(new ErrorHandler("Job not found!", 404));
  }

  // Check if the user has already applied
  const isAlreadyApplied = await Application.findOne({
    "jobInfo.jobId": id,
    "jobSeekerInfo.id": req.user._id,
  });
  if (isAlreadyApplied) {
    return next(new ErrorHandler("You have already applied for this job.", 400));
  }

  // Handle file upload (resume)
  const jobSeekerInfo = {
    id: req.user._id,
    name,
    email,
    phone,
    address,
    coverLetter,
    role: "Job Seeker",
  };

  if (req.files && req.files.resume) {
    const { resume } = req.files;
    try {
      const cloudinaryResponse = await cloudinary.uploader.upload(
        resume.tempFilePath,
        { folder: "Job_Seeker_Resume" }
      );
      jobSeekerInfo.resume = {
        public_id: cloudinaryResponse.public_id,
        url: cloudinaryResponse.secure_url,
      };
    } catch (error) {
      return next(new ErrorHandler("Failed to upload resume.", 500));
    }
  }

  // Ensure required employer info is set
  const employeInfo = {
    id: jobDetails.postedBy,
    role: "Employer",
  };

  // Ensure required fields for job info
  const jobInfo = {
    jobId: id,
    jobTitle: jobDetails.title,
  };

  // Set defaults for deletedBy
  const deletedBy = {
    jobSeeker: false,
  };

  // Create the application
  const application = await Application.create({
    jobSeekerInfo,
    employeInfo,
    jobInfo,
    deletedBy,
  });

  res.status(201).json({
    success: true,
    message: "Application submitted successfully!",
    application,
  });
});

export const employerGetAllApplications = catchAsyncErrors(
  async (req, res, next) => {
    const { _id } = req.user;
    const applications = await Application.find({
      "employerInfo.id": _id,
      "deletedBy.employer": false,
    });
    res.status(200).json({
      success: true,
      applications,
    });
  }
);

export const jobSeekerGetAllApplication = catchAsyncErrors(
  async (req, res, next) => {
    const { _id } = req.user;
    console.log("User ID from req.user:", _id); // Debug log

    try {
      const applications = await Application.find({
        "jobSeekerInfo.id": _id,
        $or: [{ "deletedBy.jobSeeker": false }, { "deletedBy.jobSeeker": { $exists: false } }],
      });

      console.log("Applications found:", applications.length); // Debug log
      if (!applications.length) {
        return res.status(404).json({
          success: false,
          message: "No applications found for this user.",
        });
      }
      console.log(applications)
      res.status(200).json({
        success: true,
        applications,
      });
    } catch (error) {
      console.error("Error fetching applications:", error);
      return next(new ErrorHandler("Failed to fetch applications.", 500));
    }
  }
);


export const deleteApplication = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const application = await Application.findById(id);
  if (!application) {
    return next(new ErrorHandler("Application Already Deleted!", 400));
  }

  const { role } = req.user;
  switch (role) {
    case "Job Seeker":
      application.deletedBy.jobSeeker = true;
      await application.save();
      break;
    case "Employer":
      application.deletedBy.employer = true;
      await application.save();
      break;
    default:
      console.log("Defalut case for deleteing application!");
      break;
  }
  if (
    application.deletedBy.employer === true &&
    application.deletedBy.jobSeeker === true
  ) {
    await application.deleteOne();
  }
  res.status(200).json({
    success: true,
    message: "Application deleted!",
  });
});
