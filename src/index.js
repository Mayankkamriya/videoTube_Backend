import dotenv from 'dotenv'
import connectDB from './db/index.js'
import app from './App.js'

dotenv.config({path: './env'})

connectDB()
.then( ()=>{ // connectDB() ho jaye to(then) usme error aaye to (catch)
    app.listen(process.env.PORT || 8000 ,()=>{
console.log(`server is running at port : ${process.env.PORT}`)
    })

}) 
.catch((err)=>{
    console.log("MONGOdb connection failed!" , err)
})
