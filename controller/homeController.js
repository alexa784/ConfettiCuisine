
module.exports = {
  index: (req, res) => {
    res.render("index.ejs");
  },
  chat: (req,res,next)=>{
    if(req.user){
		res.render("users/chat.ejs");
    }else{
		console.log("user nije ulogovan, redirekcija sa /chat na /");
		res.locals.path="/";
    }
	next();
  },
  redirectView: (req,res,next)=>{
    if(res.locals.path){
      res.redirect(res.locals.path);
    }else
		next();
  }
}