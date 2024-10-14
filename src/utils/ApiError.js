
// Instead of using try-catch in every file we have make a different error file we just need to give status and the message for that status


class ApiError extends Error{
    constructor(
        statusCode,
        message ="Something went wrong",
        errors =[],
        stack= ""
    ){
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.Success = false
        this.errors = errors
    

    if(stack){
        this.stack = stack
    }
    else   {
        Error.captureStackTrace(this, this.constructor)
    }

    }
}
export default ApiError