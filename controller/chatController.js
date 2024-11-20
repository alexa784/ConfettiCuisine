const MessageModel=require("../model/message.js");
const UserModel=require("../model/user.js");

module.exports=(io)=>{
    io.on("connection",client=>{
        console.log("new connection");
        client.on("disconnect",()=>{
            client.broadcast.emit("user disconnected");     // send a message to all other connected sockets(browsers that are currently talking to server)
            console.log("user disconnected");
        });
        client.on("message",(message)=>{
            let messageAttributes={
                content: message.content,
                userName: message.userName,
                userId: message.userId,
                time: new Date()
            }
            let msg=new MessageModel(messageAttributes);
            UserModel.findById(messageAttributes.userId).then((user)=>{
                if(user){                                                   // try this lsn 31 (checking if userID exist in DB before message is stored in DB and emited to client)
                    msg.save().then(()=>{
                        io.emit("message",messageAttributes);
                    }).catch((error)=>{
                        console.log(`Saving message error: ${error.message}`);
                    });
                }else{
                    console.log("Message is not published because user with that ID cannot be found.");
                }
            }).catch(error=>{
                console.log(`Error by trying to find user with userID ${error}`);
            });
        });
        client.on("user-joined-chat",data=>{
            client.broadcast.emit("set-user-joined-chat",data);
        });
        MessageModel.find({})
        .sort({time: "descending"})
        .limit(50).then(messages=>{
            console.log("server posalji klijentu load-all-messages()");
            client.emit("load all messages",messages.reverse());
        })
    })
}