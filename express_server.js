const express = require("express");
const app = express();
const PORT = 8080; // 

//incorporate body parser to handle inbound data from post route
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

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

//routes for url submission form
app.route("/urls/new")
  .get((req, res) => {
    res.render("urls_new");
  })

//route handler to display single URL and its shortened form
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[this.shortURL] };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});