class ApiResponse{
    constructor(statusCode, data,message = "Success"){
        this.data= data
        this.statusCode= statusCode
        this.message= message
        this.Success= statusCode<400
    }
}

export default ApiResponse