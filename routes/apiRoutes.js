const router=require("express").Router();
const coursesController=require("../controller/coursesController.js");
const usersController=require("../controller/usersController.js");

router.get("/courses",coursesController.index, coursesController.filterUserCourses,coursesController.respondJSON);
router.get("/courses/:id/join", coursesController.join, coursesController.respondJSON);
router.get("/courses/:id",coursesController.show,coursesController.respondJSON);

router.get("/users/:id",usersController.show,coursesController.respondJSON);
router.get("/users",usersController.index,coursesController.respondJSON);

router.use(coursesController.errorJSON);

module.exports=router;