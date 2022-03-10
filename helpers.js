/**
 * Fxn generateRandomString returns a string of 6 random alphanumeric characters
 * @param {number}
 * @returns {string}
 */
const URL_LENGTH = 6;
const generateRandomString = (URL_LENGTH) => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < URL_LENGTH; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

/**
 * Fxn getUserByEmail accesses user id from users database using the user's email
 * @param {object} users
 * @param {string} email
 * @returns {string || boolean}
 */
function getUserByEmail(users, email) {
  for (const key in users) {
    if (users[key].email === email) {
      return key;
    }
  }
  return false;
}

/**
 * Fxn checkDuplicateEmail checks if the user attempts to register with an existing email.
 * @param {string} email
 * @returns {boolean}
 */
function checkDuplicateEmail(users, email) {
  for (let key in users) {
    if (users[key].email === email) {
      return true;
    }
  }
  return false;
}

/**
 * Fxn checkUserID checks if the user has logged in with correct login credentials.
 * @param {*} users
 * @param {*} email
 * @param {*} password
 * @returns {string || boolean}
 */

const checkUserID = (users, email, password) => {
  for (const key in users) {
    if (users[key].email === email && users[key].password === password) {
      return key;
    }
  }
  return false;
};

module.exports = { URL_LENGTH, generateRandomString, getUserByEmail, checkDuplicateEmail, checkUserID };
