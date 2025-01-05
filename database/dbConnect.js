import mongoose from "mongoose";

const dbConnection = () => {
    mongoose.connect(process.env.MONGO_URL, {
        dbName: "jobportal"
    }).then(() => {
        console.log("Database Connected")

    }).catch((err) => {
        console.log(`Failed to Connect with database ${err}`)
    })
}

export default dbConnection