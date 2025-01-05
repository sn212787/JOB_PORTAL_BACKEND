import mongoose from 'mongoose'

const applicationSchema = mongoose.Schema({
    jobSeekerInfo: {
        id: { 
        type: mongoose.Schema.Types.ObjectId,
        required: true
        },
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        phone: {
            type: Number,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        resume: {
            public_id: String,
            url: String
        },
        coverLetter: {
            type: String,
            required: true
        },
        role: {
            type: String,
            required: true,
            enum: ["Job Seeker"]
        },
    },

    employeInfo: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        role: {
            type: String,
            enum: ["Employer"],
            required: true
        }
    },

    jobInfo: {
        jobId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        jobTitle: {
            type: String,
            required: true
        }
    },

    deletedBy: {
        jobSeeker: {
            type: Boolean,
            required: true,
            default:false
        }
    }
    
})
export const Application = mongoose.model("Application", applicationSchema)