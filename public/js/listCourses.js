$(document).ready(()=>{
    $("#modal-button").click(()=>{
        console.log("kliknuti");
        $(".modal-body").html(``);
        $.get("/api/courses",(results={})=>{
            let data=results.data;
            if(!data || !data.courses) return;

            data.courses.forEach((course)=>{
                console.log(data.courses);
                console.log(`course.joined= ${course.joined}`);
                console.log(`${course.joined ? "joined-button":"join-button"}" data-id="${course._id}`);
                const euroSign = '0x20AC';
                $(".modal-body").append(`
                    <div>
                        <span class="course-cost">${course.price}&euro;</span>
						<span class="course-title">
							${course.title}
						</span>
                        <button class="${course.joined ? "joined-button":"join-button"}" data-id="${course._id}">
                            ${course.joined ? "Joined" : "Join"}
                        </button>
						<div class="course-description">
							${course.description}
						</div>
					</div>
                    `);
            });
        }).then(()=>{                                       // add event listener after AJAX request complete
            addJoinButtonListener();
        });
    })
});

let addJoinButtonListener=()=>{
    $(".join-button").click((event)=>{
        let $button=$(event.target);
        let courseId=$button.data("id");

        $.get(`/api/courses/${courseId}/join`,(results={})=>{
            let data=results.data;
            if(data && data.success){
                $button.text("Joined").addClass("joined-button").removeClass("join-button");    // change the style of button if joining to the course was successfull
            }else{
                $button.text("Try again");
            }
        });
    });
}
const socket=io();
$("#chatForm").submit(()=>{                     // emit an event when form is submitted
    let text=$("#chat-input").val();
    let userId=$("#chat-user-id").val();
    let userName=$("#chat-user-name").val();
    socket.emit("message",{
        content: text,
        userId: userId,
        userName: userName
    });
    $("#chat-input").val("");
    return false;
});
socket.on("message",(message)=>{                // listen for an event, and populate the chat box with messages that are currently sended
    displayMessage(message);
    for(let i=0;i<2;++i){
        $(".chat-icon").fadeOut(200).fadeIn(200);
    }
});
socket.on("load all messages",(messages)=>{     // when user connects, load all messages at once in chat
    console.log("klijent load-all-messages()");
    messages.forEach(message=>{
        displayMessage(message);
    });
    socket.emit("user-joined-chat",{
        userName: $("#chat-user-name").val()
    });
});
socket.on("set-user-joined-chat",(data)=>{
    if(data.userName){
        $("#chat").prepend($("<li>").html(`
            <strong>Notice</strong>
            ${data.userName} has joined the chat.
        `));
    }
});
socket.on("user disconnected",()=>{
    displayMessage({
        userName: "Notice",
        content: "User left the chat"
    });
})
let displayMessage=(message)=>{                 // display every message from the server in the chat box
    let msgStyling=getCurrentUserClass(message.userId);
    $("#chat").prepend($("<li>").html(`
        <strong class="message ${msgStyling}">
            ${message.userName}
        </strong>:
        ${message.content}
    `));
}
let getCurrentUserClass=(userIdMessage)=>{
    let userIdForm=$("#chat-user-id").val();
    console.log(`getCurrentUserClass() userIdForm= ${userIdForm}`);
    return userIdMessage===userIdForm ? "current-user":"";
}