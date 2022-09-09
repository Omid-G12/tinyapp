const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');

const generateRandomString = function() {
  return Math.random().toString(36).substring(2, 8);
};

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cookieParser());

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const urlsForUser = function(id) {
  const userList = {};
  let keys = Object.keys(urlDatabase);
  for (let key of keys) {
    if (urlDatabase[key].userID === id) {
      userList[key] = {
        longURL: urlDatabase[key].longURL,
      };
    }
  }
  return userList;
}

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
    if (bcrypt.compareSync(input, users[key].password)) {
      return users[key];
    }
  }
  return null;
};

app.get("/", (req, res) => {
  const id = req.cookies.user_id;

  if (!id) {
    res.redirect("/login");
  } 
  
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/big", (req, res) => {
  res.send("True!");
});

app.get("/register", (req, res) => {
  const id = req.cookies.user_id;
  if (id) {
    res.redirect("/urls");
  } else {
    const templateVars = { 
      user: users[id],
    };  
    res.render("register", templateVars);
  }
});

app.get("/urls", (req, res) => {
  const id = req.cookies.user_id;

  const user = users[id];
  if (!user) {
    res.send("You must <a href='/login'>Login</a> before accessing the URLs!")
    
  } else {
    const list = urlsForUser(id);
    console.log(list);
    const templateVars = { 
      user: user,
      urls: list,
    };
    res.render("urls_index", templateVars);
  }
  
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
  const id = req.cookies.user_id;
  if (id) {
    const list = urlsForUser(id);
    const keys = Object.keys(list);
    if (list && keys.includes(req.params.id)) {
      const templateVars = { 
        user: users[id],
        id: req.params.id, 
        longURL: list[req.params.id].longURL,
      };
      res.render("urls_show", templateVars);
    } else {
      res.send("You do not have access to this URL! Please <a href='/login'>Login</a> or try again!")
    }
    
  } else {
    res.send("You must <a href='/login'>Login</a> before accessing the URLs!")
  }
  
});

app.get("/u/:id", (req, res) => {
  //console.log(req.params.id);
  let keys = Object.keys(urlDatabase);
  for (let key of keys) {
    //console.log(urlDatabase[key].userID);
    console.log(req.params);
    if (key === req.params.id) {
      const URL = urlDatabase[key].longURL;
      res.redirect(URL);
    }
  }
  res.send("<b>Error</b>: Requested ID does not exist! ")
});

app.get("/login", (req, res) => {
  const id = req.cookies.user_id;
  if (id) {
    res.redirect("/urls");
  } else {
    const templateVars = { 
      user: users[id],
      //urls: urlDatabase
    };
    res.render("login", templateVars);
  }
});

app.post("/urls", (req, res) => {
  if (req.cookies["user_id"]) {
    //console.log(req); // Log the POST request body to the console
    let id = generateRandomString();
    urlDatabase[id] = {
      longURL: req.body.longURL,
      userID: req.cookies["user_id"],
    }
    //console.log(urlDatabase);
    res.redirect("/urls"); // Respond with 'Ok' (we will replace this)
  } else {
    res.send("<html><body>You must register/login before making short URLs!</body></html>\n")
  }
  
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.cookies.user_id;
  if (id) {
    const list = urlsForUser(id);
    const keys = Object.keys(list);
    if (list && keys.includes(req.params.id)) {
      delete urlDatabase[req.params.id];
      res.redirect("/urls");
    } else {
      res.send("You do not have access to this URL!")
    }
  } else {
    res.send("You must <a href='/login'>Login</a> first before accessing this URL!")
  }   
});
  

app.post("/urls/:id", (req, res) => {
  //console.log(urlDatabase[req.params.id]);
  const id = req.cookies.user_id;
  if (id) {
    const list = urlsForUser(id);
    const keys = Object.keys(list);
    if (list && keys.includes(req.params.id)) {
      urlDatabase[req.params.id].longURL = req.body.newURL;
      res.redirect("/urls");
    } else {
      res.send("You do not have access to this URL!")
    }
  } else {
    res.send("You must <a href='/login'>Login</a> first before accessing this URL!")
  }
});

app.post("/login", (req, res) => {
  let newUser = findUser(req.body.email);
  let newPass = findPass(req.body.password);
  if (!newUser || !newPass) {
    res.statusCode = 403;
    res.send("Invalid Login! Please <a href='/login'>Try Again</a>");
  }
  res.cookie('user_id', newUser.id);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  const id = req.cookies.user_id;
  res.clearCookie('user_id', id);
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (!email|| !password) {
    res.send("Email or Password cannot be blank! Please <a href='/register'>Try Again!</a>");
    res.statusCode = 400;
  } 
  //check if email exists
  let newUser = findUser(email);
  //console.log(newUser);
  if (newUser) {
    res.send("User already exists! Please <a href='/register'>Try Again!</a>");
    res.statusCode = 400;
  } else {
    const random = generateRandomString();
    //console.log(req.body.email, req.body.password);
  users[random] = {
    id: random,
    email: email,
    password: hashedPassword,
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