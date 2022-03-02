/**
 * function returns a string of 6 random alphanumeric characters
 * @returns {string}
 */

const URL_LENGTH = 6;
const generateRandomString = (URL_LENGTH) => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
};

module.exports = { generateRandomString };