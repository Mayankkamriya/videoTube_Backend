import mongoose,{Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"

const userSchema = new Schema(
    {
        username:{
            type:String,
            require: true,
            unique: true,
            lowercase:true,
            trim : true,
            index: true // helpful For search
        },
         email:{
            type:String,
            require: true,
            unique: true,
            lowercase:true,
            trim : true,
        },
         fullName:{
            type:String,
            require: true,
            lowercase:true,
            trim : true,
        },
        avatar:{
            type:String, // cloudinary url
            required:true,
        },
        coverImage:{
            type:String, // cloudinary url
        },
        watchHistory:[
            {
                type:Schema.Types.ObjectId,
                ref:"Video"
            }
        ],
        password:{
            type:String, 
            required:[true,"password is required"],
        },
        refreshToken:{
            type:String,
        },
},
{
    timestamps: true
})

userSchema.pre("save", async function (next){  //Every time when someone do click on save then this schema start before saving
    if(!this.isModified("password")) return next(); // If password is not modified do nothing
    this.password= await bcrypt.hash(this.password,10)//If password is modifying then convert in bcrypt
    next()
})

userSchema.methods.isPasswordCorrect = async function 
(password) {    // password is user enter password 
    return await  bcrypt.compare(password ,this.password) // this.password is password enter by user at registration  
}

userSchema.methods.generateAccessToken = function(){
     return jwt.sign(
     {
         _id: this._id,
         email: this.email,
         username: this.username,
         fullName: this.fullName
     },
     process.env.ACCESS_TOKEN_SECRET,
         {
         expiresIn:process.env.ACCESS_TOKEN_EXPIRY
         }
     )
}

userSchema.methods.generateRefreshToken = function(){
   return jwt.sign(
    {
        _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    }
   )
}


export const User = mongoose.model("User",userSchema)