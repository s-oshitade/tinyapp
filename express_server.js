const { generateRandomString, URL_LENGTH } = require('./generate-random-string');
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; //

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static("public"));

//set ejs as the view engine
app.set("view engine", "ejs");

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//route handler for GET/register
app.get("/register", (req, res) => {
  const user_id = req.cookies["user_id"];
  const user = users[user_id];
  const templateVars = { 
    user: user
  };
  res.render("urls_register", templateVars);
})

//helper function for checking duplicate email
function checkDuplicateEmail(email) {
  for(let key in users){
    if(users[key].email === email){
      return true;
    }
  }
  return false;
}

//route handler for POST/register
app.post("/register", (req, res) => { 
  const email = req.body.email;
  const password = req.body.password;
  if(!email || !password){ //check that email or password are not blank
    res.status(400).send("Please check the email or password! They cannot be empty.")
  } 
  let result = checkDuplicateEmail(email);
  if(result){ //email was already taken
      res.status(400).send("This email has already been taken!");
  } 
  //if the code is still running at this point, then the user can be registered.
  const user = generateRandomString(URL_LENGTH);
  users[user] = { id: user, email, password }  
  res.cookie('user_id', user)
  console.log("users: ", users)
  res.redirect('/urls');
})

//route handler for urls
app.get("/urls", (req, res) => {
  const user_id = req.cookies["user_id"];
  const user = users[user_id];
  const templateVars = { 
    urls: urlDatabase,
    user: user
  };
  res.render("urls_index", templateVars);
});

//route handler for login
app.post("/login", (req, res) => {
  const username = req.body.username;
  res.cookie('username', `${username}`); //set cookie to the value submitted via login form
  res.redirect('/urls');
})

//route handler for logout
app.post("/logout", (req, res) => {
  // const cookieObj = req.cookies;
  // const cookieName = Object.keys(cookieObj).toString(); @TODO: FIND OUT WHY THE COOKIENAME DOES NOT WORK WITH cURL command.
  res.clearCookie("user_id");
  res.redirect("/urls");
})

//routes for url submission form
app.get("/urls/new", (req, res) => {
  const user_id = req.cookies["user_id"];
  const user = users[user_id];
  const templateVars = { 
    user: user
  };
  res.render("urls_new", templateVars);
});
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(URL_LENGTH);
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

//route handler to show single URL and its shortened form
app.get("/urls/:shortURL", (req, res) => {
  const user_id = req.cookies["user_id"];
  const user = users[user_id];
  const shortURL = req.params.shortURL;
  const templateVars = { 
    shortURL, 
    longURL: urlDatabase[shortURL],
    user: user
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
