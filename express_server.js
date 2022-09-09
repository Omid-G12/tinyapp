const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const generateRandomString = function() {
  return Math.random().toString(36).substring(2, 8);
};

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const findUser = function(input) {
  let keys = Object.keys(users);
  for (let key of keys) {
    if (users[key].email === input) {
      return users[key];
    }
  }
  return null;
};

const findPass = function(input) {
  let keys = Object.keys(users);
  for (let key of keys) {
    if (users[key].password === input) {
      return users[key];
    }
  }
  return null;
};

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/big", (req, res) => {
  res.send("True!");
});

app.get("/register", (req, res) => {
  if (req.cookies["user_id"]) {
    res.redirect("/urls");
  } else {
    const templateVars = { 
      user: users[req.cookies["user_id"]],
    };  
    res.render("register", templateVars);
  }
});

app.get("/urls", (req, res) => {
  const templateVars = { 
    user: users[req.cookies["user_id"]],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (req.cookies["user_id"]) {
    const templateVars = { 
      user: users[req.cookies["user_id"]],
      //urls: urlDatabase
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
  
});

app.get("/urls/:id", (req, res) => {
  //console.log(req.body);
  const templateVars = { 
    user: users[req.cookies["user_id"]],
    id: req.params.id, 
    longURL: urlDatabase[req.params.id]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  //console.log(req.params.id);
  let keys = Object.keys(urlDatabase);
  for (let key of keys) {
    //console.log(urlDatabase[key].userID);
    console.log(req.params);
    if (key === req.params.id) {
      const URL = urlDatabase[key];
      res.redirect(URL);
    }
  }
  res.send("<html><body><b>Error:</b> Requested ID does not exist!</body></html>")
});

app.get("/login", (req, res) => {
  if (req.cookies["user_id"]) {
    res.redirect("/urls");
  } else {
    const templateVars = { 
      user: users[req.cookies["user_id"]],
      //urls: urlDatabase
    };
    res.render("login", templateVars);
  }
});

app.post("/urls", (req, res) => {
  if (req.cookies["user_id"]) {
    //console.log(req); // Log the POST request body to the console
    let id = generateRandomString();
    urlDatabase[id] = req.body.longURL;
    //console.log(urlDatabase);
    res.redirect("/urls"); // Respond with 'Ok' (we will replace this)
  } else {
    res.send("<html><body>You must register/login before making short URLs!</body></html>\n")
  }
  
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  console.log(urlDatabase[req.params.id]);
  urlDatabase[req.params.id] = req.body.newURL;
  //console.log(req.body.newURL);
  res.redirect("/urls");

});

app.post("/login", (req, res) => {
  let newUser = findUser(req.body.email);
  let newPass = findPass(req.body.password);
  if (newUser && newPass) {
    //console.log(newUser);
    res.cookie('user_id', newUser.id);
    res.redirect("/urls");
  } else if (!newUser) {
    res.statusCode = 403;
    res.send("403: invalid email address!");
  } else if (newUser && !newPass) {
    res.statusCode = 403;
    res.send("403: invalid password!");
  } 
  
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id', req.body['user_id']);
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  //console.log(req.body.email);
  //console.log(users);
  //check if email or pass is empty
  if (!req.body.email || !req.body.password) {
    res.send("400!!!");
    res.statusCode = 400;
  } 
  //check if email exists
  let newUser = findUser(req.body.email);
  //console.log(newUser);
  if (newUser) {
    res.send("400 email already exists!");
    res.statusCode = 400;
  } else {
    const random = generateRandomString();
    //console.log(req.body.email, req.body.password);
  users[random] = {
    id: random,
    email: req.body.email,
    password: req.body.password
  };
  //console.log(users[random]);
  res.cookie('user_id', users[random].id);
  res.redirect("/urls");
  //console.log(users);
  }
});

app.get("*", (req, res) => {
  res.send("404 not found!")
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});