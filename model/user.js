const mongoose=require("mongoose");
const subscriberModel=require("./subscriber.js");
const passportLocalMongoose=require("passport-local-mongoose");         // create connection between passport module and database so we can through passport function to encrypt data and store it to database, and to authenticate user who is stored already in database 
const randToken=require("rand-token");                                  // pacakge for generating tokens

mongoose.Promise=global.Promise;
const Schema=mongoose.Schema;

const userSchema=new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    zipCode: {
        type: Number,
        min:[10000,'Zip Code cannot be under 10 000.'],
        max:[99999,'Zip Code cannot be over 99 999'],
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    dateCreated:{
        type: Date,
        required: true
    },
    dateUpdated:{
        type: Date
    },
    subscribedAccount: {type: mongoose.Schema.Types.ObjectId, ref:"Subscriber"},
    courses: [{type: mongoose.Schema.Types.ObjectId, ref:"Course"}]
});
// connecting subscriber that have same email as user, to user that
// we are currently creating. This function will be called every time when "save()" is called, but before save(). 
userSchema.pre("save",function(next){            
    let user=this;
    if(user.subscribedAccount===undefined){
        console.log(user.email);
        subscriberModel.findOne({email: user.email}).then((subscriber)=>{
            if(subscriber){
                user.subscribedAccount=subscriber;
            }
            next();
        }).catch((error)=>{
            next(error);
        });
    }else{
        next();
    }
})
userSchema.plugin(passportLocalMongoose,{                   // passportLocalMongoose dodaje hash and salt fields in User model
    usernameField: "email"                                  // treat email field of each user for authentication (because email is unique for each user)
});

const User=mongoose.model("User",userSchema);
module.exports=User;