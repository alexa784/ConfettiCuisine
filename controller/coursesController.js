const courseModel=require("../model/course.js");
const httpStatus=require("http-status-codes");
const userModel=require("../model/user.js");
const { isObjectIdOrHexString } = require("mongoose");
const mongoose=require("mongoose");

function getCourseParams(req_body, newCourse){      // newCourse is flag needed for adding dateCreated or dateUpdated attributes
    let courseParams={
        title: req_body.title,
        description: req_body.description,
        items: getArrayofItems(req_body.items),
        zipCode: Number(req_body.zipCode),
        price: req_body.price
    }
    if(newCourse){
        courseParams.dateCreated= Date();
    }else courseParams.dateUpdated=Date();
    return courseParams;
}
function getArrayofItems(str){
    return str.split(" ");
}
module.exports={
    index:(req,res,next)=>{                                                             // [CRUD]
        courseModel.find({}).then((courses)=>{
            res.locals.courses=courses;
            next();
        }).catch((error)=>{
            next(error);                    // its sended directly to "processErrors()" middleware at the end of mainController.js
        });
    },
    indexView:(req,res)=>{                                                             // [CRUD]
        res.render("courses/index.ejs");
    },
    new: (req,res)=>{                                                                  // [CRUD]
        res.render("courses/new.ejs");
    },
    create: (req,res,next)=>{                                                           // [CRUD]
        let formData=getCourseParams(req.body,true);
        courseModel.create(formData).then((course)=>{
            req.flash("success",`Course ${course.title} created successfully!`);
            res.locals.redirectPath="/courses";
            next();
        }).catch((error)=>{
            res.locals.redirectPath="/courses";
            req.flash("error",`Failed to create course because: ${error.message}`);
            next();
        });
    },
    redirectView: (req,res,next)=>{                                                      // [CRUD]
        let redirectPath=res.locals.redirectPath;
        if(redirectPath) res.redirect(redirectPath); 
        else next();
    },
    show: (req,res,next)=>{                                                             // [CRUD]
        let courseId=req.params.id;
        courseModel.findById(courseId).then((course)=>{
            if(course){
                res.locals.course=course;
            }else{
                req.flash("error",`Failed to show because course doesn't exist.`);
            }
            next();
        }).catch((error)=>{
            req.flash("error",`Failed to create user account because: ${error.message}`);
            next(error);
        });
    },
    showView: (req,res)=>{                                                              // [CRUD]
        res.render("courses/show.ejs");
    },
    edit:(req,res,next)=>{
        let courseId=req.params.id;
        courseModel.findById(courseId).then((course)=>{
            if(course){
                res.locals.course=course;
                res.render("courses/edit.ejs");
            }else{
                next(new Error(`Course with id= ${courseId} doesn't exist`));
            }
        }).catch((error)=>{
            next(error);
        });
    },
    update: (req,res,next)=>{                                                           // [CRUD]
        let courseId=req.params.id;
        let courseParams=getCourseParams(req.body,false);
        courseModel.findByIdAndUpdate(courseId,{$set: courseParams}).then((course)=>{
            if(course){
                req.flash("success",`Course ${course.title} updated successfully!`);
                res.locals.redirectPath=`/courses/${courseId}`;
            }else{ 
                req.flash("error",`Course is not updated because it doesn't exist in database.`);
                res.locals.redirectPath="/courses";
             }
             next();
        }).catch((error)=>{
            res.locals.redirectPath=`/courses/${courseId}/edit`;
            req.flash("error",`Course failed to update because: ${error.message}`);
            next();
        });
    },
    delete: (req,res,next)=>{                                                           // [CRUD]
        let courseId=req.params.id;
        courseModel.findByIdAndDelete(courseId).then((course)=>{
            if(course){
                res.locals.redirectPath="/courses";
                req.flash("success",`Course ${course.title} deleted successfully!`);
            }else{
                req.flash("error",`Course is already deleted.`);
                res.locals.redirectPath="/courses";
            }
            next();
        }).catch((error)=>{
            req.flash("error",`Course failed to delete because: ${error.message}`);
            next();
        });
    },
    respondJSON: (req,res)=>{
        console.log("respondJSON()");
        res.json({
            status: httpStatus.OK,
            data: res.locals
        })
    },
    errorJSON: (error,req,res,next)=>{
        let errorObject;
        console.log(`pozvan errorJSON() error= ${error}`);
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
    },
    join: (req,res,next)=>{                                         // join courses from modal list of courses
        let courseId=req.params.id;
        let currentUser=req.user;
        if(currentUser){
            if(userAlreadyJoinedCourse(currentUser,courseId)) next();
            courseModel.findById(courseId).then((course)=>{
                currentUser.courses.push(course._id);
                userModel.findByIdAndUpdate(currentUser,{courses: currentUser.courses}).then((user)=>{
                    if(user){
                        res.locals.success=true;
                        next();
                    }else{
                        next(new Error("User cannot be found in db."));
                    }
                }).catch(error=>{
                    next(error);
                });
            })
        }else{
            next(new Error("User must log in."));
        }
    },
    filterUserCourses: (req,res,next)=>{
        let currentUser=res.locals.currentUser;
        if(currentUser){
            let allCourses=res.locals.courses;
            let mappedCourses=allCourses.map((course)=>{
                course=course.toObject();                   // transform from Mongoose object to JS object
                course["joined"]=currentUser.courses.some((userCourseId)=>{
                    return userCourseId.equals(course._id);
                });
                return course;
            });
            res.locals.courses=mappedCourses;
        }
        next();
    },
}
function userAlreadyJoinedCourse(user,courseId){
    user.courses.forEach(courseObjId=>{
        if(courseObjId.toString()===courseId){
            return true;
        }
    });
    return false;
}