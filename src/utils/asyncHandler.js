const asyncHandler =(requestHandler)=>{
   return (req,res,next)=>{
    Promise.resolve(requestHandler(req,res,next)).catch((err) => next(err))
    }
}

export {asyncHandler}



        // Steps of making Highorder function

// const asyncHandler = () => {}
// const asyncHandler = (func) => () => {}
// const asyncHandler = (func) => async () => {}