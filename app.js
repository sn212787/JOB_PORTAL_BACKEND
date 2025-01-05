import express from 'express'
import { config } from 'dotenv'
import cors from 'cors'
import fileUpload from 'express-fileupload'
import cookieParser from 'cookie-parser'
import dbConnection from './database/dbConnect.js'
import { errorMiddleware } from './middlewares/error.js'
import userRoute from './routes/userRoute.js'
import jobRoute from './routes/jobRoute.js'
import appRoute from './routes/appRoute.js'
import { newsLetterCron } from './automation/newsLetter.js'

const app = express()
config({path: './config/config.env'})

app.use(cors({
    origin:[process.env.FRONT_END_URL],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}))


// for accessing jwt token
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/"
}))


app.use('/api/v1/user', userRoute)
app.use('/api/v1/job', jobRoute)
app.use('/api/v1/application', appRoute)

newsLetterCron()
dbConnection()
app.use(errorMiddleware)
export default app