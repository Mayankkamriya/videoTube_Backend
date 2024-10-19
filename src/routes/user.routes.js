import { Router } from "express";
import {logoutUser, loginUser,registerUser,refreshaccessToken } from "../controllers/user.controllers.js";
import {upload} from "../middlewares/multer.middleware.js";
import  { verifyJWT}  from "../middlewares/auth.middleware.js";


const router=Router();

router.route("/register").post(
upload.fields([   // inserting an middleware upload (for uploading) before registerUser file
        {
            name:"avatar",
            maxCount: 1
        },
        {
            name:"coverImage",
            maxCount: 1
        }
    ]),       
    registerUser)
    router.route("/login").post(loginUser)

    // Secured route because user need to be login for doing these action

    router.route("/logout").post(verifyJWT,logoutUser) //Before logout we've added middleware (verifyJWT)
    
    router.route("/refresh-token").post(refreshaccessToken) //Here we do not need to use verify and Jwt because we have already done in refreshaccesstoken function

 
export default router
