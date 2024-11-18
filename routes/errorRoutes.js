const router=require("express").Router();
const errorController=require("../controller/errorController.js");

router.use(errorController.handleAllErrors);

module.exports=router;