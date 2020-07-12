// jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyparser = require('body-parser');
const ejs = require("ejs");
const lodash = require("lodash");
const mongoose = require('mongoose');
const passport = require("passport");
const session = require("express-session");
const passportmongoose = require("passport-local-mongoose");
const PORT = process.env.PORT || 5000;
const app = express();

//bodyparser initialization
app.use(bodyparser.urlencoded({ extended: true }));

//ejs initailization
app.set("view engine",'ejs');
app.use(express.static('public'));

//initialize express-session and passport
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());





//mongoose and passportlocalmongoose initialization
mongoose.connect(process.env.DBHOST, {useNewUrlParser: true});
const userSchema = new mongoose.Schema({
name:String,
username:String,
password:String,
email:String

});
userSchema.plugin(passportmongoose);
const userx = mongoose.model('userx', userSchema);

passport.use(userx.createStrategy());

passport.serializeUser(userx.serializeUser());
passport.deserializeUser(userx.deserializeUser());


// get requests
app.get("/",function(req,res){
  if(req.user){
    res.render("success",{name:req.user.name});
  }
  else{
    res.render("login",{
      err:""
    });
}
});


app.get("/signup",function(req,res){
  if(req.user){
    res.render("success",{name:req.user.name});
  }
  else{
    res.render("signup",{
      name:"",
      email:"",
      err:""
    });
}


});

app.get("/login",function(req,res){
  if(req.user){
    res.render("success",{name:req.user.name});
  }
  else{
    let err = req.query.message;
    res.render("login",{
      err:err||""
    });
}

});

app.get("/success",function(req,res){
if(req.user){
  res.render("success",{name:req.user.name});
}
  else{
    res.redirect("/");
  }
});

app.get("/logout",function(req,res){
  req.logout();
  res.redirect('/');

});
app.get("/forgotpassword",function(req,res){
  if(req.isAuthenticated()){
    res.render("forgot",{err:""});
  }
  else{
    res.redirect("/");
  }
});

app.post("/forgotpassword",function(req,res){
if(req.isAuthenticated()){
  let oldpassword = req.body.password;
  let newpassword = req.body.newpassword1;
  let username = req.user.username;

  userx.findOne({username:username},function (err, users){
    if(err){
        res.render("forgot",{err:err});
    }
    else{
      users.changePassword(oldpassword,newpassword,function(err){
        if(err){
        res.render("forgot",{err:err});
        }
        else{
          res.redirect("/success");
        }
      });
    }
  });

}


});



//post requests

app.post("/signup",function(req,res){
  if(req.user){
    res.render("success",{name:req.user.name});
  }
    else{
let name = req.body.name;
let username = req.body.username;
let password = req.body.password;
let email = req.body.email;

userx.register({username:username,name:name,email:email},password,function(err,user){
  if(err){
    res.render("signup",{
      name:name||"",
      email:email||"",
      err:err||""
    });
  }
  else{
    passport.authenticate('local')(req, res, function () {
           res.redirect('/success');
         });
}

});
}
});

app.post("/login", passport.authenticate("local",{
    successRedirect: "/success",
    failureRedirect: "/login?message="+"Invalid username or password"
}), function(req, res){

});

app.get("/reset",function(req,res){

});

app.get("/validate",function(req,res){
  res.render("validate",{err:""});
});

app.post("/validate",function(req,res){
let username = req.body.username;
let email = req.body.email;
let password = " ";
userx.findOne({ username:username}, password, function (err, docs) {
if(err){
  res.render("validate",{err:err});
}
else{
  if(docs.email === email){
  docs.authenticate(password, function(err){
         res.render('resetpwd',{err:"",username:username});
       });
     }
     else{
         res.render("validate",{err:"invalid Entry"});
     }
}

});

});

app.get("/resetpwd",function(req,res){
  if(req.isAuthenticated()){
  res.render("resetpwd",{err:"",username:req.user.username});
}
else{
  res.redirect("/");
}
});

app.post("/resetpwd",function(req,res){
  let password1 = req.body.password;
  let username = req.body.username;

    userx.findOne({username:username},function (err, users){
      if(err){
          res.render("resetpwd",{err:err,username:"database error"});
      }
      else{
        console.log(users.password);
        if (users){
          users.setPassword(password1,function(err){
          if(err){
          res.render("resetpwd",{err:err,username:"changepasswordE"});
          }
          else{
            users.save();
            res.redirect("/");
          }
        });
      }
    }

       });
    //let username = req.user.username;





});
















app.listen(PORT, (req, res) => {
  console.log("listening...");
});
