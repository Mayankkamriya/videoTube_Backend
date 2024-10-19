import ApiError from "../utils/ApiError.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import {User} from "../models/user.js";

export const verifyJWT = asyncHandler(async(req,res,
    next)=>{
       try { // take token either from cookies or from Authorization

         const token = req.cookies?.accessToken || req.
        header("Authorization")?.replace("Bearer ","")
        console.log("Extracted Token:",token)

         if(!token){
             throw new ApiError(401,"unauthorized request")
         }
 
         // if token receive then verify it from register token and this time token
 const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
 
 const user = await User.findById(decodedToken?._id)
 .select("-password -refreshToken")
 
 if(!user){
     throw new ApiError(401, "Invalid Access Token")
 }
 
 req.user =user 
 next()
 
       } catch (error) {
        throw new ApiError(401 , error?.message || "Invalid access token")
       }

})

