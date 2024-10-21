import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError  from "../utils/ApiError.js"
import {User} from "../models/user.js"
import uploadonCloudinary from "../utils/cloudinary.js" 
import ApiResponse  from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessAndRefreshToken= async(userID) =>{
try {

    const user = await User.findById(userID)

    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false }) // for saving of refresh token in DB
    // by validateBeforeSave: false it did not ask password for save refresh token

    return {accessToken,refreshToken}
    }
    catch (error) {
    throw new ApiError(500, "Something went wrong while generating refresh and access token")

}}

const registerUser = asyncHandler(async (req,res) =>{  
/* Step of alorithum (Steps of our work process)
    --  Get user details from frontend
    --  Validation - should not be empty
    --  Check if user already exists: by username, email
    --  Check for images, check for avatar
    --  Upload them to cloudinary, avatar
    --  Create user object - create entry in db
    --  Remove password and refresh token field from response
    --  Check for user creation
    --  Return response      */
    

    // console.log("Files:", req.files); // Debugging to check file uploads
    // console.log("Body:", req.body);


    const {fullName,email, username, password} = req.body // extracting data point from body
    // console.log("email: " ,email);

    if (        // figureout that any one of them should not be empty
        [ fullName,email, username, password].some((field)=>
        field?.trim()==="")
    ){
        throw new ApiError(400,"All field are required")
    }

    const existedUser = await User.findOne({
        $or: [  // chequing whether user exists or not with his username or email
            { username: req.body.username }, 
            { email: req.body.email }],
    })

    if (existedUser) {
        throw new ApiError(400,"User with email or username already exists")
    }

    let avatarLocalPath;
    if (req.files && Array.isArray(
        req.files.avatar) && req.files.avatar.length>0){
            avatarLocalPath= req.files?.avatar?.[0]?.path
        } 

    if (!avatarLocalPath) {
            throw new ApiError(400,"Avatar file is required")
    }
         
        let coverImageLocalPath;
    if (req.files && Array.isArray(
        req.files.coverImage) && req.files.coverImage.length>0){
            coverImageLocalPath= req.files?.coverImage?.[0]?.path
        } 

        avatarLocalPath = avatarLocalPath.replace(/\\/g, "/");
        coverImageLocalPath = coverImageLocalPath?.replace(/\\/g, "/");

        // console.log("Avatar Path:", avatarLocalPath);  // Check avatar path
        // console.log("Cover Image Path:", coverImageLocalPath);


    //if avatar or coverImage found upload on cloudinary
        const avatar = avatarLocalPath ? await uploadonCloudinary(avatarLocalPath) : null;
        const coverImage = coverImageLocalPath ? await uploadonCloudinary(coverImageLocalPath) : null;
    
    if(!avatar){
        // console.error("Cloudinary upload failed or returned null");
        throw new ApiError(400, "avatar file is required")
    }
        // console.log("Cloudinary Upload Response:", avatar);


    // if all happening successfull then create object
        const user = await User.create({
            fullName,
            avatar: avatar.url,
            coverImage: coverImage?.url || "",
            email,
            password,
            username: username.toLowerCase()
        })

        const createdUser = await User.findById(user._id).select(
            "-password -refreshToken"
        )

    if(!createdUser){
        throw new ApiError(500,"something went wrong while registering the user")
    }

        return res.status(201).json(
        new ApiResponse(200,createdUser,"user registered Successfully")
    )

})


    const loginUser = asyncHandler(async (req,res) =>{
  /* Step of alorithum (Steps of our work process)
    -- req body -> data
    -- username or email base access
    -- find the user
    -- password check 
    -- send cookie      */


    const {email,username,password}= req.body       // extracting data point from body
    // console.log("Received Login Request Body:", req.body)  // it shows Which email and what password enter in request body

    if(!username && !email){
        throw new ApiError(400, "username or email is required")
    }

        const user = await User.findOne({
        $or:[{username},{email}]    // search user on basis of unsername or email
    }) 
    // console.log("check user", user) //We can see all details of user because we find the user

    if(!user){
        throw new ApiError(400, "user not exist ")
    }

        const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401,"Invalid user credentials")
    }
        
        const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user);
        // console.log("Generated Access Token:", accessToken);
        console.log("Generated Refresh Token:", refreshToken);

        const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
        // console.log("Logged In User:", loggedInUser); //We can see all details of user because we find the user

        const options ={
            httpOnly:true,
            secure: true
        }

    return res.status(200)
    .cookie("accessToken", accessToken,options)
    .cookie("RefreshToken", refreshToken,options)
    .json(new ApiResponse(200, {
        user: loggedInUser,accessToken,
        refreshToken
    },"user login successfully"
    ))
})

    const logoutUser = asyncHandler(async (req,res) =>{
  /*Step of alorithum (Steps of our work process)
    -- Verify user
    -- Update refreshToken as undefined
    -- Get updated values
    -- Clear accessToken and refreshToken
    */ 
        await User.findByIdAndUpdate(
            req.user._id,{
                $set:{ // set use for updating items
                    refreshToken: undefined // we define refreshToken as undefine for logout 
                }
            },{
                new:true // By this we get new value of refresh token which is undefined that is necessary for logout
            }
        )
        const options ={
            httpOnly:true,
            secure:true
        }

        return res.status(200)
        .clearCookie("accessToken",options)
        .clearCookie("refreshToken",options)
        .json(new ApiResponse(200,{},"User logged out"))
})

const refreshaccessToken = asyncHandler(async(req, res) => {

/*
 -- we need to remember that first you need to send refresh token in request.body in Postman.      
 -- And you get refreshed open by passing login request in request body. 
 -- After passing request we need to check VScode terminalfro refresh token.
 -- After getting refresh token we write Refresh token in request.body in postman for new access token which w
e sese in res.body. */

 try {
    // Extract refresh token from cookies or body
    const incomingRefreshToken = req.cookies
    ?.refreshToken || req.body?.refreshToken;

    // console.log("\n incomingRefreshToken: ", incomingRefreshToken);          // encrypted
    
    if (!incomingRefreshToken) { 
        throw new ApiError(401, "Unauthorized request - Missing refresh token");
    }

    const decodedToken = jwt.verify(     // Verify the token
        incomingRefreshToken, 
        process.env.REFRESH_TOKEN_SECRET);

    // console.log("\n Decoded token: ", decodedToken); // normal _id, iat, exp 

    // Fetch the user based on the decoded token's ID
    const user = await User.findById(decodedToken?._id);
    if (!user) {
        throw new ApiError(401, "Invalid refresh token - User not found");
    }
    // console.log("\n user's stored refresh token: ",  user.refreshToken )   // encrypted
      
    // Compare the incoming token with the user's stored refresh token
    if (incomingRefreshToken !== user.refreshToken) {
        throw new ApiError(401, "Refresh token is expired or already used");
    }

    // Generate new access and refresh tokens
    const { accessToken, newrefreshToken } = await generateAccessAndRefreshToken(user._id);
    // console.log("\n New Access Token Generate: ", accessToken);     // encrypted

    // Set cookies for the new tokens
    const options = {
        httpOnly: true,
        secure: true
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newrefreshToken, options)
        .json(
            new ApiResponse(200, 
                { accessToken, refreshToken: newrefreshToken }, 
                "Access token refreshed"
            ));

    } catch (error) {
        throw new ApiError(401, error?.message || 
            "Invalid refresh token");
    }
});

const changeCurrentPassword = asyncHandler(async(req,res)=>{
    
    const {oldPassword,newPassword} = req.body
    
    console.log("oldPassword: ",oldPassword)
    console.log("newPassword: ",newPassword)
    
    const user = await User.findById(req.user?._id)
    console.log("user: ",user)
    
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400,"Invalid old Password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave:false})

    return res
    .status(200)
    .json(new ApiResponse(200, {} , "Password changed succesfully"))


})

const getCurrentUser = asyncHandler(async(req,res)=>{

    const user = await User.findByIdAndUpdate(
        req.user?._id,).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200,user, "Cover image updated successfully"))
})

const updateAccountDetails = asyncHandler(async(req,res)=>{
    const { fullName, email } = req.body; // Extract fullName and email from req.body
    const user = await User.findByIdAndUpdate(
      // Check if fullName and email are coming through correctly
    // console.log("FullName:", fullName, "Email:", email);
        req.user?._id,
        {
            $set:{ 
                fullName: fullName,  // both ways are correct
                email: email
            }
        },
        { new: true }
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200 ,user , "Account details updates successfully"))


})

const updateUserAvatar = asyncHandler(async(req,res)=>{

    const avatarLocalPath = req.file?.path
if (!avatarLocalPath) {
        throw new ApiError(400,"Invalid old Password")
    }

    const avatar = await uploadonCloudinary(avatarLocalPath)
if(!avatar.url){
    throw new ApiError(400,"Error while uploading on avatar")
}

    const user= await User.findByIdAndUpdate(
    req.user?._id,
    {
        $set:{
            avatar: avatar.url
        }
    },
    {new: true}
).select("-password")

return res
.status(200)
.json(
    new ApiResponse(200,user, "Avatar  image updated successfully")
)
})

const updateUserCoverImage = asyncHandler(async(req,res)=>{

    const coverImageLocalPath = req.file?.path
if (!coverImageLocalPath) {
    throw new ApiError(400,"Cover image file is missing")
}

    const coverImage = await uploadonCloudinary(coverImageLocalPath)
if(!coverImage.url){
    throw new ApiError(400,"Error while uploading on coverImage")
}

    const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
        $set:{
            coverImage: coverImage.url
        }
    },
    {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
    new ApiResponse(200,user, "Cover image updated successfully")
)
})


const getUserChannelProfile = asyncHandler(async(req,res)=>{
    const {username} = req.params //we get username from url it means params rather than req.body

    if(!username?.trim){
 throw new ApiError(400, "username is missing")
    }

const channel =await User.aggregate([
    {
        $match :{ // first we match user
            
        //     username: username?.toLowerCase()
        username: { $regex: new RegExp(`^${username?.toLowerCase()}`, "i") }

        }
    },
    {
        $lookup:{ //counting subscriber through channel
            from :"subscriptions",
            localField:"_id",
            foreignField:"channel",
            as:"subscribers"
        }
    },
    {
        $lookup:{//counting of subscribeTO through subscriber
            from :"subscriptions",
            localField:"_id",
            foreignField:"subscriber",
            as:"subscriberTo"
        }
    },
    {
        $addFields: { // we add field like subscribersCount

            subscribersCount: {
                
                // $size: "$subscribers"
                $size: { $ifNull: ["$subscribers", []] }


            },
            channelsSbubscribedToCount:{
                
                // $size:"$subscribedTo"
                $size: { $ifNull: ["$subscribedTo", []] }

            },
            isSubscribed:{
                $cond:{
                    if:{
                        $in:[req.user?._id,"$subscribers.subscriber"]},
                        then: true,
                        else: false
                }
            }
        }
    },
    {
        $project: {
            fullName:1,
            username:1,
            subscribersCount: 1,
            channelsSbubscribedToCount:1,
            isSubscribed:1,
            avatar:1,
            coverImage:1,
            email:1
        }
    }
])

console.log("Aggregation result: ",channel)

if(!channel?.length){  // if channel does not exits
    throw new ApiError(400, "channel does not exist")
    }

    return res
    .status(200)
    .json(  // we have returned only first object
        new ApiResponse(200, channel[0] ,"User channel fetched successfully")
    )

})

const getWatchHistory = asyncHandler(async(req,res)=>{
    const user = await User.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(req.
                    user._id)
            }
        },
        {
            $lookup:{
                from: "videos",  // by this we get videos for watchHistory 
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",

                pipeline:[ // but in video we want owner also that's why we created one more pipeline
                    {
                        $lookup:{  
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as:"owner",
                            pipeline:[ // subpipeline
                                { //  we implementing our pipeline inside lookup  
                        $project: { // we do not want all detail of owner. we tell what we want to project
                            fullName:1,
                            username:1,
                            avatar:1
                        }
                            }
                        ]

                        }
                    },
                    {
                        $addFields:{
                        owner:{
                            $first:"$owner"
                            }
                        }
                    }   
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(   // from user aggregation we take 1st value
            200 , user[0].watchHistory,
            "watch History fecthed successfully"
        )
    )

})

export {registerUser,loginUser,logoutUser,
    refreshaccessToken,changeCurrentPassword,
    getCurrentUser,updateAccountDetails,
    updateUserAvatar,updateUserCoverImage,
    getUserChannelProfile,getWatchHistory}
