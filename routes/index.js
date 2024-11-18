const router=require("express").Router();
const userRoutes=require("./userRoutes");
const subscriberRoutes=require("./subscriberRoutes");
const courseRoutes=require("./courseRoutes");
const homeRoutes=require("./homeRoutes");
const errorRoutes=require("./errorRoutes");
const apiRoutes=require("./apiRoutes.js");

router.use("/users",userRoutes);                // namespace users
router.use("/subscribers",subscriberRoutes);    // namespace subscribers
router.use("/courses",courseRoutes);            // namespace courses
router.use("/api",apiRoutes);                   // namespace api
router.use("/",homeRoutes);
router.use("/",errorRoutes);


module.exports=router;