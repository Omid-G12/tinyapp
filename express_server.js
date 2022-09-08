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

app.get("/", (req, res) => {
  res.redirect("/urls");
  //console.log(req.body.username)
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { 
    username: req.cookies["username"],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  //console.log(req.body);
  const templateVars = { 
    username: req.cookies["username"],
    id: req.params.id, longURL: urlDatabase[(req.params.id)] };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  //console.log(req.params.id);
  const longURL = urlDatabase[(req.params.id)];
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  console.log(req); // Log the POST request body to the console
  let id = generateRandomString();
  urlDatabase[id] = req.body.longURL;
  res.send("Ok"); // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.newURL;
  //console.log(req.body.newURL);
  res.redirect("/urls");

});

app.post("/login", (req, res) => {
  //console.log(req.body.username);
  res.cookie('username', req.body.username);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie('username', req.body.username);
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});