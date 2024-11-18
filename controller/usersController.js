const userModel=require("../model/user.js")
const passport=require("passport");
const expressValidator=require("express-validator");
const token=process.env.TOKEN || "recipeT0k3n";         // [API] token will get value from TOKEN variable(if it is defined) or use recipeT0k3n value(if TOKEN isn't defined) 
const jsonWebToken=require("jsonwebtoken");             // JWT
const httpStatus=require("http-status-codes");

function getUserParams(req_body,newUser){       // newUser is flag that is needed for adding dateCreated or dateUpdated
    let userParams={
        firstName: req_body.firstName,
        lastName: req_body.lastName,
        email: req_body.email,
        password: req_body.password,
        zipCode: Number(req_body.zipCode),
    }
    if(newUser){
        userParams.dateCreated= Date();
    }
    else{
        userParams.dateUpdated= Date();
    }
    return userParams;
}
module.exports={
    index: (req,res,next)=>{                                    // [CRUD]
        userModel.find({}).then((users)=>{
            res.locals.users=users;
            next();
        }).catch(error=>{
            next(error);
        });
    },
    indexView: (req,res)=>{                                    // [CRUD]
        if(req.query.format==="json"){
            res.json(res.locals.users);
        }else{
            res.render("users/index.ejs");
        }
    },
    new:(req,res)=>{                                            // [CRUD] get request that require sign up form
        res.render("users/new.ejs");
    },
    create: (req,res,next)=>{                                   // [CRUD] post request that handle data from sign up form
        if(req.skip){
            next();
            return;
        }
        let newUser=new userModel(getUserParams(req.body,true));
       
        userModel.register(newUser,req.body.password,(error,user)=>{
            console.log(`user= ${user}`)
            if(user){
                req.flash("success",`${user.firstName}'s account created successfully!`);
                res.locals.redirectPath="/users";
                next();
            }else{
                req.flash("error",`Failed to create user account because: ${error.message}.`);
                res.locals.redirectPath="/users/new";
                next();
            }
        });
    },
    create1: (req,res,next)=>{                                   // [CRUD] post request that handle data from sign up form
        let userParams=getUserParams(req.body,true);
        console.log(userParams);
        userModel.create(userParams).then((user)=>{
            req.flash("success",`${user.firstName}'s account created successfully!`);
            res.locals.redirectPath="/users";
            res.locals.user=user;
            next();
        }).catch((err)=>{
            console.log(`Error saving user: ${err.message}`);
            res.locals.redirectPath="/users/new";
            req.flash("error",`Failed to create user account because: ${err.message}`);
            next();
        });
    },
    redirectView: (req,res,next)=>{                             // [CRUD] showing page that corresponds to the redirectPath 
        let redirectPath=res.locals.redirectPath;
        console.log("pozvan redirectView()");
        if(redirectPath){
            console.log("redirektuj");
            res.redirect(redirectPath);
        }
        else next();
    },
    show: (req,res,next)=>{                                    // [CRUD]
        let userId=req.params.id;
        res.locals.userId=userId;
        userModel.findById(userId).then((user)=>{
            if(user){
                res.locals.user=user;
                next();
            }
            else next(new Error(`Show() user data: User[id= ${userId}] doesn't exist`));
        }).catch((error)=>{
            next(error);
        });
    },
    showView: (req,res)=>{                                              // [CRUD]
        res.render("users/show.ejs");
    },
    edit: (req,res,next)=>{                                           // [CRUD]
        let userId=req.params.id;
        userModel.findById(userId).then((user)=>{
            if(user){
                res.locals.user=user;
                res.render("users/edit.ejs");
            }else{
                next(new Error(`User with id= ${userId} doesn't exist!`));
            }
        }).catch((error)=>{
            next(error);
        });
    },
    update: (req,res,next)=>{                                           // [CRUD]
        let userId=req.params.id;
        let userParams=getUserParams(req.body,false);
        userModel.findByIdAndUpdate(userId,{$set: userParams}).then((user)=>{
            if(user){
                res.locals.redirectPath=`/users/${user._id}`;
                res.locals.user=user;
                req.flash("success",`${user.firstName}'s account updated successfully!`);
            }else{
                res.locals.redirectPath="/users";
                req.flash("error",`Failed to update user account because user doesn't exist in database`);
            }
            next();
        }).catch((error)=>{
            res.locals.redirectPath=`/users/${userId}/edit`;
            req.flash("error",`Failed to update user account because: ${error.message}`);
            next();
        });
    },
    delete: (req,res,next)=>{                                          // [CRUD]
        let userId=req.params.id;
        userModel.findByIdAndDelete(userId).then((user)=>{
            if(user){
                res.locals.redirectPath="/users";
                res.locals.user=user;
                req.flash("success",`${user.firstName}'s account deleted successfully!`);
            }else{
                res.locals.redirectPath="/users";
                req.flash("error",`Failed to delete user account because user is already deleted.`);
            }
            next();
        }).catch((error)=>{
            res.locals.redirectPath="/users";
            req.flash("error",`Failed to delete user account because: ${error.message}`);
            next();
        });
    },
    validate: (req,res,next)=>{
        req.sanitizeBody("email").normalizeEmail({all_lowercase: true}).trim();
        req.check("email","Email is invalid").isEmail();
        req.check("zipCode","Zip code is invalid").notEmpty().isInt().isLength({
            min: 5,
            max: 5
        }).equals(req.body.zipCode);
        req.check("password","Password cannot be empty").notEmpty();

        req.getValidationResult().then((error)=>{
            if(!error.isEmpty()){
                let messages=error.array().map(e=>{return e.msg});
                req.skip=true;
                req.flash("error",message.join(" and "));
                res.locals.redirectPath="/users/new";
                next();
            }else{
                next();
            }
        });
    },
    authenticate: passport.authenticate("local", {
        failureRedirect: "/users/login",
        failureFlash: "Failed to login.",
        successRedirect: "/",
        successFlash: "Logged in!"
    }),
    login: (req,res)=>{
        res.render("users/login.ejs");
    },
    logout: (req,res,next)=>{
        req.logout((err)=>{
            if(err){next(err);}
            else{
                req.flash("success","You have been logged out!");
                res.locals.redirectPath="/";
                next();
            }
        });
    },
    verifyToken: (req,res,next)=>{          // vise ne treba, sluzilo za tokene bez koristenja JWT sistema
        let token=req.query.apiToken;
        if(token){
            userModel.findOne({apiToken: token}).then((user)=>{
                if(user) next();
                else next(new Error("Invalid API token"));
            }).catch((error)=>{
                next(new Error(error.message));
            })
        }else next(new Error("Invalid API token"));
    },
    // logovanje preko command prompta curl -d "email=mwalberg@gmail.com&password=mw123" http://localhost:3000/api/login
    apiAuthenticate: (req,res,next)=>{          // JWT sistem
        console.log("apiAuthenticate()");
        passport.authenticate("local",(error,user)=>{
            if(user){
                let signedToken=jsonWebToken.sign(
                    {
                        data: user._id,
                        exp: new Date().setDate(new Date().getDate()+1)
                    },"secret_encoding_passphrase");
                res.json({
                    success: true,
                    token: signedToken
                });
            }else{
                res.json({
                    success:false,
                    message: "Could not authenticate user"
                })
            }
        })(req,res,next);
    },
    // pristupanje bilo kojoj api ruti preko command prompta
    // curl -H "token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjoiNjcyMGJlYjU3NTE4ODVlYjNkNzhhOWZmIiwiZXhwIjoxNzMxMDcxMzQwMjA3LCJpYXQiOjE3MzA5ODQ5NDB9.Z25Q8_ZttFIPoDZ4IUwrC9cpL6WC0L2VldN8ATBIcZE" http://localhost:3000/api/courses
    verifyJWT: (req,res,next)=>{
        let token=req.headers.token;
        if(token){
            jsonWebToken.verify(token,"secret_encoding_passphrase",(error,payload)=>{
                if(payload){
                    userModel.findById(payload.data).then((user)=>{
                        if(user){
                            res.locals.user=user;
                            next();
                        }
                        else{
                            res.status(httpStatus.FORBIDDEN).json({
                                error: true,
                                message: "No User account found"
                            });
                        }
                    });
                }else{
                    res.status(httpStatus.UNAUTHORIZED).json({
                        error:true,
                        message: "Cannot verify API token"
                    });
                    next();
                }
            });
        }else{
            res.status(httpStatus.UNAUTHORIZED).json({
                error: true,
                message: "Provide Token"
            });
        }
    }
}
