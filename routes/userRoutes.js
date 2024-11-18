const router=require("express").Router();
const usersController=require("../controller/usersController");

router.get("/",usersController.index,usersController.indexView);                       // [CRUD]
router.get("/new",usersController.new);                                               // [CRUD]
router.get("/login",usersController.login);
router.get("/logout",usersController.logout,usersController.redirectView);
router.get("/:id",usersController.show,usersController.showView);                     // [CRUD]
router.get("/:id/edit",usersController.edit);                                         // [CRUD]
router.post("/create",usersController.validate,usersController.create,usersController.redirectView); // [CRUD]
router.post("/login",usersController.authenticate);
router.put("/:id/update",usersController.update,usersController.redirectView);         // [CRUD]
router.delete("/:id/delete",usersController.delete, usersController.redirectView);        // [CRUD]

module.exports=router;