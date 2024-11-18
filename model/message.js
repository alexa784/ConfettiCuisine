const mongoose=require("mongoose");
const {Schema}=require("mongoose");

const messageSchema=new Schema({
    content: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    userId:{
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    time:{
        type: Date,
        required: true
    }
});

module.exports=mongoose.model("Message",messageSchema);