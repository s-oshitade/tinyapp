const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const app = express();
const PORT = 8080;
const {
  URL_LENGTH,
  generateRandomString,
  getUserByEmail,
  checkDuplicateEmail,
  checkUserID
} = require('./helpers');

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ["key1"],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
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
  sgq3y6: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};

//Route handler for GET/register
app.get("/register", (req, res) => {
  const user_id = req.session.user_id;
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
  let result = checkDuplicateEmail(users, email);
  if (result) { //email was already taken
    return res.status(400).send("<h2>This email has already been taken! Login <a href='/login'>here</a>.</h2>");
  }
  const hashedPassword = bcrypt.hashSync(password, 10); //hash password
  //if the code is still running at this point, then the user can be registered
  const user = generateRandomString(URL_LENGTH);
  users[user] = { id: user, email, password: hashedPassword };
  // res.cookie('user_id', user);
  req.session.user_id = user;
  console.log(users);
  res.redirect('/urls');
});

//route handlers for login
app.get("/login", (req, res) => {
  const user_id = req.session.user_id;
  const user = users[user_id];
  const templateVars = {
    user: user,
  };
  res.render("urls_login", templateVars);
});
app.post("/login", (req, res) => {
  const {email, password} = req.body;
  if (!email || !password) { //check that email or password are not blank
    return res.status(400).send("<h2>1. Please check the email or password! They cannot be empty.</h2>");
  }
  const user = getUserByEmail(users, email);
  if (!user) {
    return res.status(403).send("<h2>Invalid request. Please register <a href='/register'>here</a>!</h2>");
  }
  if (user) {
    console.log("user object", user)
    console.log("password", user.password)
    if (bcrypt.compareSync(password, user.password)) {
      req.session.user_id = user.id;
      return res.redirect('/urls');
    }
  }
  return res.status(403).send("<h2>Invalid credentials! Please <a href='/register'>try</a> again.</h2>");
});

//route handler for logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

//route handler for urls
app.get("/urls", (req, res) => {
  if (!req.session.user_id) {
    return res.status(400).send("<h2>Please <a href='/register'>register</a> or <a href='/login'>login</a> to access the requested page!</h2>");
  }
  const user_id = req.session.user_id;
  if (!user_id) {
    return res.status(403).send("<h2>Please login <a href='/login'>here</a> to access the requested page!</h2>");
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
    console.log("Please login <a href='/login'>here</a> to access the requested page!");
    return res.redirect("/login");
  }
  //Filter urlDatabase by comparing userID with logged-in user's ID
  const urlsForUser = function(id) {
    const user_id = req.session.user_id;
    const user = users[user_id];
    const email = user.email;
    const password = user.password;
    const isLoggedIn = checkUserID(users, email, password);
    let userUrlDatabase = {};
    for (const shortURL in urlDatabase) {
      if (isLoggedIn === urlDatabase[shortURL].userID) {
        userUrlDatabase[shortURL] = urlDatabase[shortURL].longURL;
      }
    }
    return userUrlDatabase;
  };
  userUrlDatabase = urlsForUser(isLoggedIn);
  templateVars.urls = userUrlDatabase;
  res.render("urls_index", templateVars);
});

//Routes for url submission form
app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    return res.status(400).send("<h2>Please <a href='/register'>register</a> or <a href='/login'>login</a> to access the requested page!</h2>");
  }
  const user_id = req.session.user_id;
  if (!user_id) {
    return res.status(403).send("<h2>Please login <a href='/login'>here</a> to access the requested page!</h2>");
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
    console.log("Please login <a href='/login'>here</a> to access the requested page!");
    return res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  const user_id = req.session.user_id;
  if (!user_id) {
    return res.status(401).send("<h2>Unauthorized request. Please login <a href='/login'>here</a> to access the requested page!</h2>");
  }
  const user = users[user_id];
  const email = user.email;
  const password = user.password;
  const isLoggedIn = checkUserID(users, email, password);
  if (!isLoggedIn) {
    return res.status(401).send("<h2>Unauthorized request. Please login <a href='/login'>here</a> to access the requested page!</h2>");
  }
  const shortURL = generateRandomString(URL_LENGTH);
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = { longURL: longURL, userID: user_id};
  res.redirect(`/urls/${shortURL}`);
});

//Route handler to show single URL and its shortened form
app.get("/urls/:shortURL", (req, res) => {
  const user_id = req.session.user_id;
  if (!user_id) {
    return res.status(403).send("<h2>Please login <a href='/login'>here</a> to access the requested page!</h1>");
  }
  const user = users[user_id];
  const email = user.email;
  const password = user.password;
  const isLoggedIn = checkUserID(users, email, password);
  if (!isLoggedIn) {
    return res.status(403).send("<h2>Please login <a href='/login'>here</a> to access the requested page!</h1>");
  }
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
  if (!urlDatabase[shortURL]) {
    return res.status(400).send("<h2> Invalid request! Please use the format https://www.google.com</h2>");
  }
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

//route handler for updating URLs
app.post("/urls/:id", (req, res) => {
  const user_id = req.session.user_id;
  if (!user_id) {
    return res.status(403).send("<h1>Please login <a href='/login'>here</a> to access the requested page!</h1>");
  }
  const user = users[user_id];
  const email = user.email;
  const password = user.password;
  const isLoggedIn = checkUserID(users, email, password);
  if (!isLoggedIn) {
    return res.status(403).send("<h1>Please login <a href='/login'>here</a> to access the requested page!</h1>");
  }
  const shortURL = req.params.id;
  const longURL = req.body.edit;
  urlDatabase[shortURL] = { longURL: longURL, userID: user_id};
  res.redirect("/urls");
});

//route handler for deleting URLs
app.post("/urls/:shortURL/delete", (req, res) => {
  const user_id = req.session.user_id;
  if (!user_id) {
    return res.status(401).send("<h2>Please login <a href='/login'>here</a> to access the requested page!</h2>");
  }
  const user = users[user_id];
  const email = user.email;
  const password = user.password;
  const isLoggedIn = checkUserID(users, email, password);
  if (!isLoggedIn) {
    return res.status(401).send("<h2>Please login <a href='/login'>here</a> to access the requested page!</h2>");
  }
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

