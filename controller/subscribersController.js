const subscriberModel=require("../model/subscriber.js");
const { create } = require("../model/user.js");

function getSubscriberParams(req_body, newSubscriber){      // flag that indicates to add dateCreated or dateUpdated attribute
    let subParams={
        firstName: req_body.firstName,
        lastName: req_body.lastName,
        email: req_body.email,
        zipCode: req_body.zipCode
    }
    if(newSubscriber){
        subParams.dateCreated= Date();
    }else{
        subParams.dateUpdated= Date();
    }
    return subParams;
}

module.exports={
    index: (req,res,next)=>{                                // [CRUD]
        subscriberModel.find({}).then((subscribers)=>{
            res.locals.subscribers=subscribers;
            next();
        }).catch(error=>{
            next(error);
        });
    },
    indexView: (req,res)=>{                                  // [CRUD]
        if(req.query.format==="json"){
            res.json(res.locals.subscribers);
        }else{
            res.render("subscribers/index.ejs");
        }
    },
    new: (req,res)=>{
        res.render("subscribers/new.ejs");
    },
    create: (req,res,next)=>{                                       // [CRUD]
        let reqParams=getSubscriberParams(req.body,true);
        subscriberModel.create(reqParams).then((subscriber)=>{
            req.flash("success",`Subscriber ${subscriber.firstName} created successfully!`);
            res.locals.subscriber=subscriber;
            res.locals.redirectPath=`/subscribers/${subscriber._id}`;
            next();
        }).catch((error)=>{
            res.locals.redirectPath=`/subscribers/new`;
            req.flash("error",`Subscriber failed to create because: ${error.message}`);
            next();
        });
    },
    redirectView: (req,res,next)=>{                                         // [CRUD]
        let redirectPath=res.locals.redirectPath;
        if(redirectPath) res.redirect(redirectPath);
        else next();
    },
    show: (req,res,next)=>{                                                 // [CRUD]
        let subscriberId=req.params.id;
        subscriberModel.findById(subscriberId).then((subscriber)=>{
            if(subscriber){
                res.locals.subscriber=subscriber;
                next();
            }else next(new Error(`Subscriber (id: ${subscriberId}) doesn't exist.`));
        }).catch((error)=>{
            next(error);
        })
    },
    showView: (req,res)=>{                                                  // [CRUD]
        if(req.query.format==="json"){
            res.json(res.locals.subscriber);
        }else{
            res.render("subscribers/show.ejs");
        }
    },
    edit:(req,res,next)=>{                                                  // [CRUD]
        let subscriberId=req.params.id;
        subscriberModel.findById(subscriberId).then((subscriber)=>{
            if(subscriber){
                res.locals.subscriber=subscriber;
                res.render("subscribers/edit.ejs");
            }else{
                next(new Error(`Subscriber (id: ${subscriberId}) doesn't exist.`))
            }
        }).catch((error)=>{
            next(error);
        });
    },
    update:(req,res,next)=>{                                                  // [CRUD]
        let subscriberId=req.params.id;
        let subParams=getSubscriberParams(req.body,false);
        subscriberModel.findByIdAndUpdate(subscriberId,{$set: subParams}).then((subscriber)=>{
            if(subscriber){
                req.flash("success",`Subscriber ${subscriber.firstName} updated successfully.`)
                res.locals.redirectPath=`/subscribers/${subscriberId}`;
            }else{
                req.flash("error","Failed to update the subscriber because it doesn't exist in database.");
                res.locals.redirectPath=`/subscribers`;
            }
            next();
        }).catch((error)=>{
            req.flash("error",`Failed to update the subscriber because: ${error.message}`);
            res.locals.redirectPath=`/subscribers/${subscriberId}/edit`;
            next();
        });
    },
    delete: (req,res,next)=>{                                                  // [CRUD]
        let subscriberId=req.params.id;
        subscriberModel.findByIdAndDelete(subscriberId).then((subscriber)=>{
            if(subscriber){
                res.locals.redirectPath="/subscribers";
                res.locals.subscriber=subscriber;
                req.flash("success",`Subscriber ${subscriber.firstName} deleted successfully.`)
            }else{
                res.locals.redirectPath="/subscribers";
                req.flash("error","Failed to delete the subscriber because its already deleted.");
            }
            next();
        }).catch((error)=>{
            res.locals.redirectPath="/subscribers";
            req.flash("error",`Failed to delete the subscriber because: ${error.message}`);
            next();
        });
    }

}