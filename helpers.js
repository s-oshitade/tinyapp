function getUserByEmail(users, email) {
  for (const key in users) {
    if (users[key].email === email) {
      return key;
    }
  }
  return false;
}

module.exports = { getUserByEmail };