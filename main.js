// required libraries
const express=require("express");
const connectDB=require("./database/db.js");
const layouts=require("express-ejs-layouts");
const path=require("path");
const methodOverride=require("method-override");            // for interpreting POST request in some cases as PUT request
const expressSession=require("express-session");            // for sessions and flash messages
const cookieParser=require("cookie-parser");                // for sessions and flash messages
const connectFlash=require("connect-flash");                // for sessions and flash messages
const passport=require("passport");                         // for hashing users passwords and authentication of users
const expressValidator=require("express-validator");        // for checking whatever forms data is in corressponding format
const userModel=require("./model/user.js");
const dotenv = require('dotenv');                           // for reading enviroment variables
dotenv.config();

// create App
const app=express();
const PORT=3000;

const router=require("./routes/index.js");

// connect to the database
connectDB();

// set middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '/public')));       // for using static assets
app.use(layouts);                                               // for layouts(automatsko dodavanje header i footer za svaku stranicu)
app.use(methodOverride("_method",{methods: ["POST", "GET"]}));// for interpreting POST request in some cases as PUT or DELETE request
app.use(cookieParser("secretCuisine123"));                    // for storing flash messages in cookies,  bilo"secret_passcode"
app.use(expressSession({                                     // session that will pass flash messages between client and server
    secret: "secretCuisine123",
    cookie: {
        maxAge: 4000000
    },
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());                              // initialize passport
app.use(passport.session());                                 // configure passport to use sessions in Express.js
app.use(expressValidator());                                 // tell router to use built-in checking of forms data

app.use(connectFlash());                                     // for creating flash messages that will be in session
app.use((req,res,next)=>{                                    // transfering flash messages from req to response 
    res.locals.loggedIn=req.isAuthenticated();                  // creating local variable that we can use in layout.ejs for user status
    res.locals.currentUser=req.user;                            // creating local variable for layout.ejs

    if(req.user){
        console.log(`currentUser._id (u main)= ${req.user._id}`);
    }else
        console.log("main() user nepostoji");
    res.locals.flashMessages=req.flash();
    next();
})

// set dinamic page rendering with ejs
app.set("view engine","ejs");
app.set("port",process.env.PORT || 3000);

// set tokens to secure access to our server to users that don't use browser(for example they can use android app)
app.set("token",process.env.TOKEN || "recipeT0k3n");

// set passport for hashing passwords
passport.use(userModel.createStrategy());                             // configure the user's login strategy
passport.serializeUser(userModel.serializeUser());
passport.deserializeUser(userModel.deserializeUser());

// tell express to use router object to handle routes
app.use("/", router);

const server=app.listen(app.get("port"),()=>{
    console.log(`Server running at http://localhost:${app.get("port")}`);
})
const io=require("socket.io")(server);
require("./controller/chatController.js")(io);          // passing io object to chatController.js so we can manage sockets from there