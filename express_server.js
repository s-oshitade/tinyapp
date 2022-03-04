const { generateRandomString, URL_LENGTH } = require('./generate-random-string');
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; //

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

//set ejs as the view engine
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//route handler for urls
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//route handler for login
app.post("/login", (req, res) => {
  const username = req.body.username;
  res.cookie('username', `${username}`); //set cookie to the value submitted via login form
  console.log(req.cookies.username);
  res.redirect('/urls');
})

//routes for url submission form
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(URL_LENGTH);
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

//route handler to show single URL and its shortened form
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const templateVars = { 
    shortURL, 
    longURL: urlDatabase[shortURL] 
  };
  res.render("urls_show", templateVars);
});

//route to handle short URL requests
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

//route handler for updating URLs
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = req.body.edit;
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls");
});

//route handler for deleting URLs
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});