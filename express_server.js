const { generateRandomString, URL_LENGTH } = require('./generate-random-string');
const express = require("express");
const morgan = require('morgan');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static("public"));

//set ejs as the view engine
app.set("view engine", "ejs");

const users = {
  "aJ48lW": {
    id: "aJ48lW",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "bJ48lW": {
    id: "bJ48lW",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const urlDatabase = {
  b2xVn2: {
        longURL: "http://www.lighthouselabs.ca",
        userID: "aJ48lW"
    },
    i3BoGr: {
        longURL: "https://www.google.ca",
        userID: "aJ48lW"
    }
};

//All helper functions
//1. Helper function for checking duplicate email
function checkDuplicateEmail(email) {
  for (let key in users) {
    if (users[key].email === email) {
      return true;
    }
  }
  return false;
}
//2. helper functions for checking user credentials
//2a. lookup user by email
function lookupUserByEmail(users, email) {
  for (const key in users) {
    if (users[key].email === email) {
      return key;
    }
  }
  return false;
}
//2b. check user email and password
const checkUserID = (users, email, password) => {
  for (const key in users) {
    if (users[key].email === email && users[key].password === password) {
      return key;
    }
  }
  return false;
};

//Route handler for GET/register
app.get("/register", (req, res) => {
  const user_id = req.cookies["user_id"];
  const user = users[user_id];
  const templateVars = {
    user: user
  };
  console.log(user);
  res.render("urls_register", templateVars);
});

//Route handler for POST/register
app.post("/register", (req, res) => {
  const {email, password} = req.body; 
  if (!email || !password) { //check that email or password are not blank
    return res.status(400).send("<h2>Please check the email or password! They cannot be empty.</h2>");
  }
  let result = checkDuplicateEmail(email);
  if (result) { //email was already taken
    return res.status(400).send("<h2>This email has already been taken!</h2>");
  }
  //if the code is still running at this point, then the user can be registered.
  const user = generateRandomString(URL_LENGTH);
  users[user] = { id: user, email, password };
  res.cookie('user_id', user);
  console.log(`logged in as ${email}!`);
  res.redirect('/urls');
});

//route handlers for login
app.get("/login", (req, res) => {
  const user_id = req.cookies["user_id"]; 
  const user = users[user_id];
  // const email = req.body.email;
  // const password = req.body.password;
  // const isValidUser = checkUserID(users, email, password);
  const templateVars = {
    user: user,
    // isValidUser: isValidUser
  };
  res.render("urls_login", templateVars);
});
app.post("/login", (req, res) => {
  const {email, password} = req.body; 
  if (!email || !password) { //check that email or password are not blank
    return res.status(400).send("<h2>Please check the email or password! They cannot be empty.</h2>");
  }
  const user_key = lookupUserByEmail(users, email);
  if (!user_key) {
    return res.status(403).send("<h2>Incorrect credentials! Please register and try again.</h2>");
  }
  if (users[user_key].password !== password) {
    return res.status(403).send("<h2>Incorrect credentials! Please try again</h2>");
  }
  const isValidUser = checkUserID(users, email, password);
  if (isValidUser) {
    user = isValidUser;
    users[user] = { id: user, email, password };
    res.cookie('user_id', user);
    return res.redirect('/urls');
  }
  return res.status(400).send("<h2>Please login with valid email and password!</h2>");
});

//route handler for logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

//route handler for urls
app.get("/urls", (req, res) => {
  const user_id = req.cookies["user_id"];
  if (!user_id) {
    return res.status(403).send("<h2>Please login or register to access the requested page!</h2>");
  }
  const user = users[user_id];
  const email = user.email;
  const password = user.password;
  const isLoggedIn = checkUserID(users, email, password);
  const templateVars = {
    urls: urlDatabase,
    user: user
  };
  if (!isLoggedIn) {
    console.log("Please login to access the requested page!");
    return res.redirect("/login");
  }
  //Filter urlDatabase by comparing userID with logged-in user's ID
  const urlsForUser = function (id) {
    const user_id = req.cookies["user_id"];
    const user = users[user_id];
    const email = user.email;
    const password = user.password;
    const isLoggedIn = checkUserID(users, email, password);
    let userUrlDatabase = {}
    for(const shortURL in urlDatabase){
      if(isLoggedIn === urlDatabase[shortURL].userID){
       userUrlDatabase[shortURL] = urlDatabase[shortURL].longURL;
      }
    }
    return userUrlDatabase;
  }
  userUrlDatabase = urlsForUser(isLoggedIn);
  console.log("USERDATABASE: ", userUrlDatabase);
  templateVars.urls = userUrlDatabase;
  res.render("urls_index", templateVars);
});

//Routes for url submission form
app.get("/urls/new", (req, res) => {
  const user_id = req.cookies["user_id"];
  if (!user_id) {
    console.log("Please login to access the requested page!");
    return res.redirect("/login");
  }
  const user = users[user_id]; //Use info from cookie to access user object
  const email = user.email;
  const password = user.password;
  const isLoggedIn = checkUserID(users, email, password);
  const templateVars = {
    user: user,
    isLoggedIn: isLoggedIn
  };
  if (!isLoggedIn) {
    console.log("Please login to access the requested page!");
    return res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});
app.post("/urls", (req, res) => {
  const user_id = req.cookies["user_id"];
  if (!user_id) {
    return res.status(401).send("<h2>Unauthorized request. Please login to access requested page.</h2>");
  }
  const user = users[user_id];
  const email = user.email;
  const password = user.password;
  const isLoggedIn = checkUserID(users, email, password);
  if (!isLoggedIn) {
    return res.status(401).send("<h2>Unauthorized request. Please login to access requested page.</h2>");
  }
  const shortURL = generateRandomString(URL_LENGTH);
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = { longURL: longURL, userID: user_id};
  res.redirect(`/urls/${shortURL}`);
});

//Route handler to show single URL and its shortened form
app.get("/urls/:shortURL", (req, res) => {
  const user_id = req.cookies["user_id"];
  const user = users[user_id];
  const shortURL = req.params.shortURL;
  const templateVars = {
    shortURL,
    longURL: urlDatabase[shortURL].longURL,
    user: user
  };
  res.render("urls_show", templateVars);
});

//route to handle short URL requests
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if(!urlDatabase[shortURL]){
    return res.status(400).send("<h2>The requested resource does not exist!</h2>");
  }
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

//route handler for updating URLs
app.post("/urls/:id", (req, res) => {
  const user_id = req.cookies["user_id"];
  const shortURL = req.params.id;
  const longURL = req.body.edit;
  urlDatabase[shortURL] = { longURL: longURL, userID: user_id};
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

//Driver code
console.log(urlDatabase);