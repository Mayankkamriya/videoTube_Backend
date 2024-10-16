import { Router } from "express";
import {logoutUser, loginUser,registerUser } from "../controllers/user.controllers.js";
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

    router.route("/logout").post(verifyJWT,logoutUser) //Before logout we've added middleware (verifyJWT)

export default router
