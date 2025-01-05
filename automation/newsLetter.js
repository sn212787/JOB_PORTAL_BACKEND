import cron from "node-cron";
import { Job } from "../models/postSchema.js";
import { User } from "../models/userSchema.js";
import { sendEmail } from "../utils/sendEmail.js";

export const newsLetterCron = () => {
  cron.schedule("*/1 * * * *", async () => {
    // console.log("Crone Automation is running")
    const jobs = await Job.find({ newsLetterSend: false });
    for (const job of jobs) {
      try {
        const filteredUsers = await User.find({
          $or: [
            { "niches.firstNiche": job.jobNiche },
            { "niches.secondNiche": job.jobNiche },
            { "niches.thirdNiche": job.jobNiche },
          ],
        });
        for (const user of filteredUsers) {
          const subject = `Hot Job Alert! ${job.title} in ${job.jobNiche} Available Now!`;
          const message = `Hi ${user.username}. \n\nGreat news! A new job that fits your niche has just been posted. 
          The position is for a ${job.title} with ${job.companyName}, and they are looking to hire immediately. 
          \n\nJob Details:\n**Position** ${job.title}\n-**Company** ${job.companyName}\n-**Location** ${job.location}\n-**Salery** ${job.salery}\n\nDont wait to long! Job  openings like they are filled quickly.\n\nWe are here to support you in your job search. Best of Luck!
          \n\nBest Regards, \nNicheNest Team`;
          sendEmail({
            email: user.email,
            subject,
            message,
          });
        }
        job.newsLetterSend = true;
        await job.save();
      } catch (error) {
        console.log("ERRORS IN NODE CRONE CATCH BLOCK");
        return next(console.error(error || "some node cron error"));
      }
    }
  });
};
