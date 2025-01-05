import mongoose from 'mongoose'

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    jobType: {
        type: String,
        required: true,
        enum: ["Full Time", "Part Time"]
    },
    location: {
        type: String,
        required: true
    },
    companyName: {
        type: String,
        required: true
    },
    introduction: {
        type: String
    },
    responsibilities:{
        type: String,
        required: true
    },
    qualifications: {
        type: String,
        required: true
    },
    offers: {
        type: String,
        
    },
    salery: {
        type: String,
        required: true
    },
    hiringMultiCandidates: {
        type: String,
        default: "No",
        enum: ["Yes", "No"]
    },
    personalWebsite: {
        title: String,
        url: String
    },
    jobNiche: {
        type: String,
        required: true
    },
    newsLetterSend:{
        type: Boolean,
        default: false
    },
    jobPostedOn:{
        type: Date,
        default: Date.now
    },
    postedBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }
})

export const Job = mongoose.model("Job", postSchema)