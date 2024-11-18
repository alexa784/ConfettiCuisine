const mongoose=require("mongoose");
mongoose.Promise=global.Promise;
const Schema=mongoose.Schema;

const courseSchema=new Schema({
    title:{
        type: String,
        required: true,
        unique: true
    },
    description:{
        type: String,
        required: true
    },
    items: [],
    zipCode:{
        type: Number,
        required: true
    },
    dateCreated:{
        type: Date,
        required: true
    },
    dateUpdated:{
        type: Date
    },
    maxStudents:{
        type: Number,
        default: 0,
        min: [0, "Course cannot have a negative number of students"]
    },
    price:{
        type: Number,
        default: 0,
        min: [0, "Course cannot have negative value of cost"]
    },
    subscribers: [{type: mongoose.Schema.Types.ObjectId, ref:"Subscriber"}]
});

const Course=mongoose.model("Course",courseSchema);
module.exports=Course;