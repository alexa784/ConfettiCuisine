const router=require("express").Router();
const subscribersController=require("../controller/subscribersController");

router.get("/",subscribersController.index,subscribersController.indexView);     // [CRUD]
router.get("/new",subscribersController.new);                                   // [CRUD]
router.get("/:id",subscribersController.show,subscribersController.showView);   // [CRUD]
router.get("/:id/edit",subscribersController.edit);                              // [CRUD]
router.post("/create",subscribersController.create,subscribersController.redirectView); // [CRUD]
router.put("/:id/update",subscribersController.update,subscribersController.redirectView);   // [CRUD]
router.delete("/:id/delete",subscribersController.delete, subscribersController.redirectView); // [CRUD]

module.exports=router;