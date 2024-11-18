const router=require("express").Router();
const coursesController=require("../controller/coursesController");

router.get("/",coursesController.index,coursesController.indexView);                 // [CRUD]
router.get("/new",coursesController.new);                                           // [CRUD]
router.get("/:id",coursesController.show,coursesController.showView);               // [CRUD]
router.get("/:id/edit",coursesController.edit);                                     // [CRUD]
router.post("/create",coursesController.create,coursesController.redirectView);     // [CRUD]
router.put("/:id/update",coursesController.update,coursesController.redirectView);   // [CRUD]
router.delete("/:id/delete",coursesController.delete, coursesController.redirectView);  // [CRUD]

module.exports=router;