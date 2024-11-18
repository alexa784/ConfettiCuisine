const multer  = require('multer');       // for getting text data from form
const homeController=require("./homeController.js");
const usersController=require("./usersController.js");
const coursesController=require("./coursesController.js");
const errorsController=require("./errorsController.js");
const subscribersController = require('./subscribersController.js');
const userModel=require("../model/user.js");
const { authenticate } = require('passport');

const upload = multer();

module.exports={
    handleAllRequest: (router)=>{
        router.get("/glupost",homeController.glupost);

        router.get("/",homeController.index);
        router.get("/signUp",usersController.getSignUp);
        router.get("/logOut",usersController.logOut);

        router.get("/subscribers",subscribersController.index,subscribersController.indexView);     // [CRUD]
        router.get("/users",usersController.index,usersController.indexView);                       // [CRUD]
        router.get("/courses",coursesController.index,coursesController.indexView);                 // [CRUD]

        router.get("/users/new",usersController.new);                                               // [CRUD]
        router.get("/subscribers/new",subscribersController.new);                                   // [CRUD]
        router.get("/courses/new",coursesController.new);                                           // [CRUD]
        
        router.get("/users/login",usersController.login);
        router.get("/users/logout",usersController.logout,usersController.redirectView);

        router.get("/users/:id",usersController.show,usersController.showView);                     // [CRUD]
        router.get("/subscribers/:id",subscribersController.show,subscribersController.showView);   // [CRUD]
        router.get("/courses/:id",coursesController.show,coursesController.showView);               // [CRUD]

        router.get("/users/:id/edit",usersController.edit);                                         // [CRUD]
        router.get("/courses/:id/edit",coursesController.edit);                                     // [CRUD]
        router.get("/subscribers/:id/edit",subscribersController.edit);                              // [CRUD]

        router.post("/users/create",usersController.validate,usersController.create,usersController.redirectView); // [CRUD]
        router.post("/subscribers/create",subscribersController.create,subscribersController.redirectView); // [CRUD]
        router.post("/courses/create",coursesController.create,coursesController.redirectView);     // [CRUD]

        router.post("/users/login",usersController.authenticate);

        router.put("/users/:id/update",usersController.update,usersController.redirectView);         // [CRUD]
        router.put("/courses/:id/update",coursesController.update,coursesController.redirectView);   // [CRUD]
        router.put("/subscribers/:id/update",subscribersController.update,subscribersController.redirectView);   // [CRUD]

        router.delete("/users/:id/delete",usersController.delete, usersController.redirectView);        // [CRUD]
        router.delete("/courses/:id/delete",coursesController.delete, coursesController.redirectView);  // [CRUD]
        router.delete("/subscribers/:id/delete",subscribersController.delete, subscribersController.redirectView); // [CRUD]

        //router.post("/logIn",upload.none(),usersController.postLogIn);

        router.get("*",homeController.getAllRoutes);                          // handle routes that doesn't exist
    },
    processErrors: (err, req, res, next)=>{                                 
        console.log(`processErrors(): ${err}`);
        errorsController.internalServerError(res);
        next();
    },
    setPassport: (passport)=>{
        passport.use(userModel.createStrategy());                             // configure the user's login strategy
        passport.serializeUser(userModel.serializeUser());
        passport.deserializeUser(userModel.deserializeUser());
    },
    logEmail: (req,res,next)=>{                                                // "try this" from lesson 24
        if(req.user) console.log(req.user.email);
        next();
    }
}
