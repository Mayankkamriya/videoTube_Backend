import { Router } from "express";
import {  registerUser,loginUser,logoutUser,
    refreshaccessToken,changeCurrentPassword,
    getCurrentUser,updateAccountDetails,
    updateUserAvatar,updateUserCoverImage,
    getUserChannelProfile,getWatchHistory } from "../controllers/user.controllers.js";
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

    router.route("/change-password").post(verifyJWT ,changeCurrentPassword)

    router.route("/current-user").get(verifyJWT ,getCurrentUser)

    router.route("/update-account").patch(verifyJWT ,updateAccountDetails)

    router.route("/avatar").patch(verifyJWT ,upload.single("avatar") , updateUserAvatar)
    
    router.route("/cover-image").patch(verifyJWT ,upload.single("coverImage"),updateUserCoverImage)

    router.route("/c/:username").get(verifyJWT ,getUserChannelProfile)

    router.route("/history").get(verifyJWT ,getWatchHistory)

    export default router
