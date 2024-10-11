import mongoose,{Schema} from "mongoose";
import jwt from "jsonwebtoken/lib/JsonWebTokenError";
import bcrypt from "bcrypt"

const userSchema = new Schema(
    {
        username:{
            type:string,
            require: true,
            unique: true,
            lowercase:true,
            trim : true,
            index: true // helpful For search
        },
         email:{
            type:string,
            require: true,
            unique: true,
            lowercase:true,
            trim : true,
        },
         fullName:{
            type:string,
            require: true,
            lowercase:true,
            trim : true,
        },
        avatar:{
            type:string, // cloudinary url
            required:true,
        },
        coverImage:{
            type:string, // cloudinary url
        },
        watchHistory:[
            {
                type:Schema.Types.ObjectId,
                ref:"Video"
            }
        ],
        password:{
            type:string, 
            required:[true,"password is required"],
        },
        refreshToken:{
            type:string,
        },
},
{
    timestamps: true
})

userSchema.pre("save", async function (next){
    if(!this.isModified("password")) return next();
    this.password= bcrypt.hash(this.password,10)
    next()
})

userSchema.method.isPasswordCorrect = async function 
(password) {
    return await  bcrypt.compare(password ,this.password)   
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
        expireIn:process.env.ACCESS_TOKEN_EXPIRY
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
        expireIn:process.env.REFRESH_TOKEN_EXPIRY
    }
   )
}


export const User = mongoose.model("User",userSchema)