const router=require("express").Router();
const homeController=require("../controller/homeController");

router.get("/",homeController.index);
router.get("/chat",homeController.chat,homeController.redirectView);

module.exports=router;