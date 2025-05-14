import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import connectDB from "./database/connection"
import chatRouter from "./routes/chatRoutes"
import aiRouter from "./routes/aiRoutes"
import userRouter from "./routes/userRoutes"


dotenv.config()
connectDB()
const app = express();
app.use(express.json())
app.use(cors({credentials:true,origin:true}))
app.use(cookieParser())

app.use("/api/v1/users",userRouter)
app.use("/api/v1/ai",aiRouter)
app.use("/api/v1/chats",chatRouter)


app.listen(process.env.PORT || 4000, ()=> {
    console.log("Server Started Successfully at PORT:",process.env.PORT)
})