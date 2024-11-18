const mongoose=require("mongoose");
mongoose.Promise=global.Promise;
const Schema=mongoose.Schema;

const subscriberSchema=new Schema({
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
        required: true,
        min: [10000, "Zip code too short"],
        max: [99999, "Zip code too long"]
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    dateCreated: {
        type: Date,
        required: true
    },
    dateUpdated: {
        type: Date
    },
    courses: [{type: mongoose.Schema.Types.ObjectId, ref:"Course"}]
    
});
subscriberSchema.methods.getInfo=function(){
    return `firstName: ${this.firstName} Email: ${this.email} Zip Code: ${this.zipCode}`;
}

const Subscriber=mongoose.model("Subscriber",subscriberSchema);
module.exports=Subscriber;