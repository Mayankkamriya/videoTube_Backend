import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";
import userRouter from './routes/user.routes.js'

const App = express()


App.use(cookieParser()); 
App.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}))

App.use(express.json({limit:"16kb"}))
App.use(express.urlencoded({ 
  extended: true,limit:"16kb"}))
  App.use(express.static("public"))


  //routes declaration
  App.use("/api/v1/users", userRouter)

// http://localhost:4000/api/v1/users + /register  or + /login
export default App;
