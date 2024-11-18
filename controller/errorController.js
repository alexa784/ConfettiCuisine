const httpStatus=require("http-status-codes");

module.exports={
    handleAllErrors: (error,req,res,next)=>{
        let errorObject;
        console.log(`pozvan errorController.handleAllErrors() error= ${error}`);
        if(error){
            errorObject={
                status: httpStatus.INTERNAL_SERVER_ERROR,
                message: error.message
            };
        }else{
            errorObject={
                status: httpStatus.INTERNAL_SERVER_ERROR,
                message: "Unknown Error."
            };
        }
        res.json(errorObject);
    }
}