import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError  from "../utils/ApiError.js"
import {User} from "../models/user.js"
import uploadonCloudinary from "../utils/cloudinary.js" 
import ApiResponse  from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken";

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
        // console.log("Generated Refresh Token:", refreshToken);

        const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
        // console.log("Logged In User:", loggedInUser); //We can see all details of user  because we find the user

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



export {registerUser,loginUser,logoutUser}
